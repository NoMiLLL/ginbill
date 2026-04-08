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
import { BuildingSpot } from '../bs/entities/bs.entity';
import { FactusMapperService } from './factus-mapper.service';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(BuildingSpot)
    private readonly bsRepository: Repository<BuildingSpot>,
    private readonly factusMapperService: FactusMapperService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, bsId: number) {
    try {
      // 1. Integración del Mapper: Enriquecimiento de datos antes de guardar
      const { items: enrichedItems, customer: enrichedCustomer } = 
        await this.factusMapperService.getEnrichedData(createInvoiceDto, bsId);

      const { customerId, items, ...data } = createInvoiceDto;

      // 2. Creación de la entidad con datos enriquecidos (Snapshot)
      const entity = this.invoiceRepository.create({
        ...data,
        items: enrichedItems,    // Guardamos el array enriquecido con la DIAN
        customer: enrichedCustomer, // Guardamos el JSON del cliente enriquecido
        bs: { id: bsId },
      });

      // 3. Guardado en la base de datos
      const savedInvoice = await this.invoiceRepository.save(entity);

      // 4. Retorno: Devolvemos la factura guardada con toda la información
      return savedInvoice;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating invoice');
    }
  }

  async findAll(bsId: number) {
    try {
      const invoices = await this.invoiceRepository.find({
        where: { bs: { id: bsId } },
      });

      const bsConfig = await this.bsRepository.findOne({ where: { id: bsId } });
      if (!bsConfig) {
        throw new NotFoundException(`Establishment with ID ${bsId} not found`);
      }

      return Promise.all(
        invoices.map((inv) => this.factusMapperService.mapInvoiceToFactusPayload(inv, bsConfig))
      );
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error fetching invoices');
    }
  }

  async findOne(id: number, bsId: number) {
    // 1. Consulta a la base de datos para obtener el registro crudo (TypeORM Entity)
    const rawInvoice = await this.invoiceRepository.findOne({
      where: { id, bs: { id: bsId } },
    });

    // 2. Validación de existencia
    if (!rawInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    try {
      // 3. Obtener la configuración del establecimiento (BuildingSpot)
      const bsConfig = await this.bsRepository.findOne({ where: { id: bsId } });
      
      if (!bsConfig) {
        throw new NotFoundException(`Establishment with ID ${bsId} not found`);
      }

      // 4. Transformación al esquema de Factus (DIAN)
      return await this.factusMapperService.mapInvoiceToFactusPayload(rawInvoice, bsConfig);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      /**
       * JUSTIFICACIÓN DE MANEJO DE ERRORES:
       * Se decide lanzar un HTTP 500 (InternalServerErrorException) en lugar de retornar el 'rawInvoice'.
       * Motivo: El contrato de este endpoint exige un esquema específico (Factus/DIAN). Devolver la entidad
       * original de la DB (TypeORM) rompería la consistencia del esquema esperado por el consumidor (frontend
       * o integraciones), lo que podría provocar fallos en cascada mucho más difíciles de depurar que un
       * error explícito de transformación.
       */
      console.error(`[Mapping Error] Failed to transform invoice ${id}:`, error);
      throw new InternalServerErrorException(
        'The invoice data is incompatible with the required legal format (Factus/DIAN).',
      );
    }
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto, bsId: number) {
    try {
      const existing = await this.invoiceRepository.findOne({
        where: { id, bs: { id: bsId } },
      });

      if (!existing) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

      const { customerId, ...data } = updateInvoiceDto;
      
      // Si se actualiza el cliente o los items, deberíamos volver a enriquecerlos?
      // Por ahora mantenemos la lógica de mezcla simple o lanzamos error si no está soportado
      const updated = this.invoiceRepository.merge(existing, data);

      if (customerId || updateInvoiceDto.items) {
        // Podríamos llamar de nuevo al mapper si fuera necesario
        const { items: enrichedItems, customer: enrichedCustomer } = 
          await this.factusMapperService.getEnrichedData({ ...existing, ...updateInvoiceDto } as any, bsId);
        
        updated.items = enrichedItems;
        updated.customer = enrichedCustomer;
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
      const existing = await this.invoiceRepository.findOne({
        where: { id, bs: { id: bsId } },
      });

      if (!existing) {
        throw new NotFoundException(`Invoice with ID ${id} not found`);
      }

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
