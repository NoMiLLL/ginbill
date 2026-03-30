import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, bsId: number) {
    try {
      const { customerId, ...data } = createInvoiceDto;
      const entity = this.invoiceRepository.create({
        ...data,
        bs: { id: bsId },
        customer: { id: customerId },
      });
      return await this.invoiceRepository.save(entity);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error creating invoice');
    }
  }

  /**
   * Mapea el DTO al formato JSON requerido por la API de Factus
   * Formato de fecha: YYYY-MM-DD
   */
  mapToFactusApi(createInvoiceDto: CreateInvoiceDto) {
    const formatDate = (date?: string) => {
      if (!date) return undefined;
      return date.split('T')[0];
    };

    return {
      numbering_range_id: createInvoiceDto.numberingRangeId,
      reference_code: createInvoiceDto.referenceCode,
      observation: createInvoiceDto.observation,
      payment_form: createInvoiceDto.paymentForm,
      payment_method_code: createInvoiceDto.paymentMethodCode,
      payment_due_date: formatDate(createInvoiceDto.paymentDueDate),
      start_date: formatDate(createInvoiceDto.startDate),
      end_date: formatDate(createInvoiceDto.endDate),
    };
  }

  async findAll(bsId: number) {
    try {
      return await this.invoiceRepository.find({
        where: { bs: { id: bsId } },
        relations: ['customer'],
      });
    } catch {
      throw new InternalServerErrorException('Error fetching invoices');
    }
  }

  async findOne(id: number, bsId: number) {
    try {
      const invoice = await this.invoiceRepository.findOne({
        where: { id, bs: { id: bsId } },
        relations: ['customer'],
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      return invoice;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching invoice');
    }
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto, bsId: number) {
    try {
      const existing = await this.findOne(id, bsId);

      const { customerId, ...data } = updateInvoiceDto;
      const updated = this.invoiceRepository.merge(existing, data);

      if (customerId) {
        updated.customer = { id: customerId } as any;
      }

      return await this.invoiceRepository.save(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating invoice');
    }
  }

  async remove(id: number, bsId: number) {
    try {
      const existing = await this.findOne(id, bsId);
      await this.invoiceRepository.remove(existing);
      return { message: 'Invoice deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting invoice');
    }
  }
}
