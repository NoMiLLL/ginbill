import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { InvoiceResponseDto } from './dto/response.dto';
import { In, Repository } from 'typeorm';

import { Invoice } from './entities/invoice.entity';
import { Product } from '../product/entities/product.entity';
import { BuildingSpot } from '../bs/entities/bs.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

export interface FactusCustomer {
  identification_document_id: number;
  identification: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  legal_organization_id: number;
  tribute_id: number;
  municipality_id: string | number;
  [key: string]: any;
}

export interface FactusItem {
  code_reference: string;
  name: string;
  quantity: number;
  discount_rate: number;
  price: number;
  tax_rate: string;
  unit_measure_id: number;
  standard_code_id: number;
  is_excluded: number;
  tribute_id: number;
  withholding_taxes: any[];
}

export interface FactusPayload {
  numbering_range_id: number;
  reference_code: string;
  observation: string;
  payment_form: string;
  payment_due_date?: string;
  payment_method_code: string;
  billing_period: {
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
  };
  customer: FactusCustomer;
  items: FactusItem[];
  total: number;
  establishment: any;
  [key: string]: any;
}

@Injectable()
export class FactusMapperService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(BuildingSpot)
    private readonly bsRepository: Repository<BuildingSpot>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private mapKeysToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((v) => this.mapKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const snakeKey = this.toSnakeCase(key);
        result[snakeKey] = this.mapKeysToSnakeCase(obj[key]);
        return result;
      }, {});
    }
    return obj;
  }

  public async getEnrichedData(createInvoiceDto: CreateInvoiceDto, bsId: number) {
    const { items, customerId } = createInvoiceDto;

    const productIds = items
      .map((item) => Number(item.productId))
      .filter((id) => !isNaN(id));

    const products = await this.productRepository.find({
      where: { 
        id: In(productIds),
        bs: { id: bsId } 
      },
    });

    const productMap = new Map<number, Product>(products.map((p) => [p.id, p]));

    const enrichedItems = items.map((item) => {
      const productInfo = productMap.get(Number(item.productId));
      if (!productInfo) {
        throw new NotFoundException(`Producto con ID ${item.productId} no encontrado o no pertenece a tu comercio.`);
      }

      return {
        productId: productInfo.id,
        code_reference: productInfo.referenceCode || productInfo.id.toString(),
        name: productInfo.name,
        quantity: item.quantity,
        discount_rate: item.discount_rate || 0,
        price: item.unit_price || productInfo.price,
        tax_rate: item.tax_rate?.toString() || '0',
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
      };
    });

    const customer = await this.customerRepository.findOne({
      where: { id: customerId, bs: { id: bsId } },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${customerId} no encontrado.`);
    }

    const enrichedCustomer = {
      ...customer,
      identification_document_id: 3,
      legal_organization_id: 2,
      tribute_id: 21,
    };

    return {
      items: enrichedItems,
      customer: enrichedCustomer,
    };
  }

  public async mapInvoiceToFactusPayload(invoiceSnapshot: any, bsConfig: any = {}): Promise<FactusPayload> {
    const rawPayload: any = {};
    
    // 1. Mapeo de campos raíz
    rawPayload.numbering_range_id = invoiceSnapshot.numberingRangeId || invoiceSnapshot.numbering_range_id;
    rawPayload.reference_code = invoiceSnapshot.referenceCode || invoiceSnapshot.reference_code;
    rawPayload.observation = invoiceSnapshot.observation;
    rawPayload.payment_form = invoiceSnapshot.paymentForm || invoiceSnapshot.payment_form;
    rawPayload.payment_method_code = invoiceSnapshot.paymentMethodCode || invoiceSnapshot.payment_method_code;
    rawPayload.description = invoiceSnapshot.description;
    rawPayload.total = Number(invoiceSnapshot.total);

    // 2. Fecha de pago
    if (rawPayload.payment_form === '2') {
      const dueDate = invoiceSnapshot.paymentDueDate || invoiceSnapshot.payment_due_date;
      rawPayload.payment_due_date = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;
    }

    // 3. Billing Period
    const startDate = invoiceSnapshot.startDate || invoiceSnapshot.start_date;
    const endDate = invoiceSnapshot.endDate || invoiceSnapshot.end_date;
    rawPayload.billing_period = {
      start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
      start_time: '00:00:00',
      end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
      end_time: '23:59:59',
    };

    // 4. Customer
    if (invoiceSnapshot.customer) {
      const customerData = this.mapKeysToSnakeCase(invoiceSnapshot.customer);
      rawPayload.customer = {
        ...customerData,
        identification_document_id: 3,
        legal_organization_id: 2,
        tribute_id: 21,
        municipality_id: invoiceSnapshot.customer.municipality_id || invoiceSnapshot.customer.municipalityId,
      };
    }

    // 5. Items
    if (invoiceSnapshot.items && Array.isArray(invoiceSnapshot.items)) {
      rawPayload.items = invoiceSnapshot.items.map((item: any) => ({
        code_reference: item.code_reference || item.productId?.toString(),
        name: item.name,
        quantity: Number(item.quantity),
        discount_rate: Number(item.discount_rate || 0),
        price: Number(item.price),
        tax_rate: item.tax_rate?.toString(),
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
      }));
    }

    // 6. Establishment (Inyectar exactamente como los otros objetos)
    if (!bsConfig || !bsConfig.name || !bsConfig.address || !bsConfig.phone || !bsConfig.email || !bsConfig.municipalityId) {
      throw new InternalServerErrorException(
        'Integrity Error: Establishment configuration is incomplete.'
      );
    }

    rawPayload.establishment = {
      name: bsConfig.name,
      address: bsConfig.address,
      phone_number: bsConfig.phone,
      email: bsConfig.email,
      municipality_id: bsConfig.municipalityId,
    };

    // 7. Retorno transformado
    return plainToInstance(InvoiceResponseDto, rawPayload, { 
      excludeExtraneousValues: true,
      enableImplicitConversion: true 
    }) as unknown as FactusPayload;
  }
}
