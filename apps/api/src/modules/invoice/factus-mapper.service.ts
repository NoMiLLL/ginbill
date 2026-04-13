import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Invoice } from './entities/invoice.entity';
import { Product } from '../product/entities/product.entity';
import { BuildingSpot } from '../bs/entities/bs.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

export const ColombianMunicipalitiesDivipola: Record<string, string> = {
  '1': '11001', // Bogotá
  '2': '05001', // Medellín
  '3': '76001', // Cali
  '4': '08001', // Barranquilla
  '5': '13001', // Cartagena
  '6': '68001', // Bucaramanga
  '7': '66001', // Pereira
  '8': '66170', // Dosquebradas
};

export interface FactusCustomer {
  identification_document_id: string;
  identification: string;
  names: string;
  address: string;
  email: string;
  phone: string;
  legal_organization_id: string;
  tribute_id: string;
  municipality_id: string;
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
  scheme_id: string;
}

export interface FactusPayload {
  numbering_range_id: number;
  reference_code: string;
  observation: string;
  payment_form: string;
  payment_due_date?: string;
  payment_method_code: string;
  operation_type: number;
  billing_period: {
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
  };
  customer: FactusCustomer;
  items: FactusItem[];
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

  private getDivipolaCode(internalId: string | number): string {
    const code = ColombianMunicipalitiesDivipola[String(internalId)];
    if (!code) {
      throw new BadRequestException('Municipio no soportado o código DIVIPOLA faltante');
    }
    return code;
  }

  private formatDivipolaCode(code: string | number): string {
    return String(code).padStart(5, '0');
  }

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
        price: Number(productInfo.price),
        tax_rate: productInfo.taxRate.toString(),
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: productInfo.isExcluded ? 1 : 0,
        tribute_id: 1,
        withholding_taxes: [],
        scheme_id: "1",
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
      identification_document_id: "3",
      legal_organization_id: "2",
      tribute_id: "21",
    };

    return {
      items: enrichedItems,
      customer: enrichedCustomer,
    };
  }

  public async mapInvoiceToFactusPayload(invoiceSnapshot: any, bsConfig: any = {}): Promise<FactusPayload> {
    const rawPayload: any = {};
    
    rawPayload.numbering_range_id = invoiceSnapshot.numberingRangeId || invoiceSnapshot.numbering_range_id;
    rawPayload.reference_code = String(invoiceSnapshot.reference_code || invoiceSnapshot.referenceCode);
    rawPayload.observation = invoiceSnapshot.observation || "";
    rawPayload.payment_form = String(invoiceSnapshot.payment_form || invoiceSnapshot.paymentForm);
    rawPayload.payment_method_code = String(invoiceSnapshot.payment_method_code || invoiceSnapshot.paymentMethodCode);
    
    // Inyección obligatoria de control fiscal
    rawPayload.operation_type = 10;

    if (rawPayload.payment_form === '2') {
      const dueDate = invoiceSnapshot.payment_due_date || invoiceSnapshot.paymentDueDate;
      rawPayload.payment_due_date = dueDate ? new Date(dueDate).toISOString().split('T')[0] : null;
    }

    const startDate = invoiceSnapshot.start_date || invoiceSnapshot.startDate;
    const endDate = invoiceSnapshot.end_date || invoiceSnapshot.endDate;
    rawPayload.billing_period = {
      start_date: startDate ? new Date(startDate).toISOString().split('T')[0] : null,
      start_time: '00:00:00',
      end_date: endDate ? new Date(endDate).toISOString().split('T')[0] : null,
      end_time: '23:59:59',
    };

    if (invoiceSnapshot.customer) {
      const customerData = this.mapKeysToSnakeCase(invoiceSnapshot.customer);
      const internalMunicipalityId = invoiceSnapshot.customer.municipality_id || invoiceSnapshot.customer.municipalityId;
      
      // Coerción forzosa de tipos (Defensa contra el rechazo 422)
      rawPayload.customer = {
        ...customerData,
        identification: String(invoiceSnapshot.customer.identification),
        phone: String(invoiceSnapshot.customer.phone),
        identification_document_id: String(invoiceSnapshot.customer.identification_document_id || 3),
        legal_organization_id: String(invoiceSnapshot.customer.legal_organization_id || 2),
        tribute_id: String(invoiceSnapshot.customer.tribute_id || 21),
        municipality_id: String(this.formatDivipolaCode(this.getDivipolaCode(internalMunicipalityId))),
      };
    }

    if (invoiceSnapshot.items && Array.isArray(invoiceSnapshot.items)) {
      rawPayload.items = invoiceSnapshot.items.map((item: any) => ({
        code_reference: String(item.code_reference || item.productId?.toString()),
        name: item.name,
        quantity: Number(item.quantity),
        discount_rate: Number(item.discount_rate || 0),
        price: Number(item.price),
        tax_rate: String(item.tax_rate),
        unit_measure_id: 70,
        standard_code_id: 1,
        is_excluded: 0,
        tribute_id: 1,
        withholding_taxes: [],
        scheme_id: "1", // Inyección de esquema obligatoria
      }));
    }

    if (!bsConfig || !bsConfig.name || !bsConfig.address || !bsConfig.phone || !bsConfig.email || !bsConfig.municipalityId) {
      throw new InternalServerErrorException(
        'Integrity Error: Establishment configuration is incomplete.'
      );
    }

    rawPayload.establishment = {
      name: bsConfig.name,
      address: bsConfig.address,
      phone_number: String(bsConfig.phone),
      email: bsConfig.email,
      municipality_id: String(this.formatDivipolaCode(this.getDivipolaCode(bsConfig.municipalityId))),
    };

    // Retorno crudo. El bypass del DTO previene la destrucción del formato.
    return rawPayload as FactusPayload;
  }
}