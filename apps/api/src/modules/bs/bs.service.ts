import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { CreateBsDto } from './dto/create-bs.dto';
import { UpdateBsDto } from './dto/update-bs.dto';
import { BuildingSpot } from './entities/bs.entity';

@Injectable()
export class BsService {
  constructor(
    @InjectRepository(BuildingSpot)
    private readonly buildingSpotRepository: Repository<BuildingSpot>,
  ) {}

  async create(createBsDto: CreateBsDto) {
    try {
      const { password, ...data } = createBsDto;
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      const entity = this.buildingSpotRepository.create({
        ...data,
        password: hashedPassword,
      });
      return await this.buildingSpotRepository.save(entity);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('El usuario con este correo electrónico o teléfono ya se encuentra registrado');
      }
      throw new InternalServerErrorException('Error al crear la cuenta');
    }
  }

  async findAll() {
    try {
      return await this.buildingSpotRepository.find();
    } catch {
      throw new InternalServerErrorException('Error fetching building spots');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const buildingSpot = await this.buildingSpotRepository.findOne({ where: { email } });

      if (!buildingSpot) {
        throw new NotFoundException('Building spot not found');
      }

      return buildingSpot;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error fetching building spot by email');
    }
  }

  async findOne(id: number) {
    try {
      const buildingSpot = await this.buildingSpotRepository.findOne({ where: { id } });

      if (!buildingSpot) {
        throw new NotFoundException('Building spot not found');
      }

      return buildingSpot;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error fetching building spot');
    }
  }

  async replace(id: number, updateBsDto: UpdateBsDto) {
    try {
      const existing = await this.buildingSpotRepository.findOne({ where: { id } });

      if (!existing) {
        throw new NotFoundException('Building spot not found');
      }

      const { password, ...data } = updateBsDto;
      const payload: any = { ...data, id };
      
      if (password) {
        payload.password = await bcryptjs.hash(password, 10);
      }

      const replaced = this.buildingSpotRepository.create(payload);
      return await this.buildingSpotRepository.save(replaced);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error replacing building spot');
    }
  }

  async update(id: number, updateBsDto: UpdateBsDto) {
    try {
      const existing = await this.buildingSpotRepository.findOne({ where: { id } });

      if (!existing) {
        throw new NotFoundException('Building spot not found');
      }

      const { password, ...data } = updateBsDto;
      const updated = this.buildingSpotRepository.merge(existing, data);

      if (password) {
        updated.password = await bcryptjs.hash(password, 10);
      }

      return await this.buildingSpotRepository.save(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error updating building spot');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.buildingSpotRepository.delete(id);

      if (!result.affected) {
        throw new NotFoundException('Building spot not found');
      }

      return { message: 'Building spot deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error deleting building spot');
    }
  }
}
