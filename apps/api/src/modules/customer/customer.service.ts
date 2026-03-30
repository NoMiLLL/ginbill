import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ResponseCustomerDto } from "./dto/customer-response.dto";

import { Customer } from './entities/customer.entity';


@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, bsId: number) {
    try {
      const entity = this.customerRepository.create({
        ...createCustomerDto,
        bs: { id: bsId },
      });
      return await this.customerRepository.save(entity);
    } catch (error) {
      throw new InternalServerErrorException('Error creating customer');
    }
  }

  async findAll(bsId: number) {
    try {
      return await this.customerRepository.find({
        where: { bs: { id: bsId } },
      });
    } catch {
      throw new InternalServerErrorException('Error fetching customers');
    }
  }

  private async findEntity(id: number, bsId: number): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { id, bs: { id: bsId } },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching customer');
    }
  }

  async findOne(id: number, bsId: number): Promise<ResponseCustomerDto> {
    const customer = await this.findEntity(id, bsId);
    return new ResponseCustomerDto(customer);
  }

  async replace(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
    bsId: number,
  ) {
    try {
      const existing = await this.findEntity(id, bsId); // Verifica propiedad

      const replaced = this.customerRepository.create({
        ...existing,
        ...updateCustomerDto,
        id,
        bs: { id: bsId },
      });
      return await this.customerRepository.save(replaced);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error replacing customer');
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto, bsId: number) {
    try {
      const existing = await this.findEntity(id, bsId);

      const updated = this.customerRepository.merge(
        existing,
        updateCustomerDto,
      );
      return await this.customerRepository.save(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating customer');
    }
  }

  async remove(id: number, bsId: number) {
    try {
      const existing = await this.findEntity(id, bsId); // Verifica propiedad
      await this.customerRepository.remove(existing);
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error deleting customer');
    }
  }
}
