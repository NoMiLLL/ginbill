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
import { BsResponseDto } from './dto/bs-response.dto';
import { UpdateBsDto } from './dto/update-bs.dto';
import { BuildingSpot } from './entities/bs.entity';

@Injectable()
export class BsService {
  constructor(
    @InjectRepository(BuildingSpot)
    private readonly buildingSpotRepository: Repository<BuildingSpot>,
  ) {}

  async create(createBsDto: CreateBsDto): Promise<BsResponseDto> {
    try {
      const { password, ...data } = createBsDto;
      const hashedPassword = await bcryptjs.hash(password, 10);

      const entity = this.buildingSpotRepository.create({
        ...data,
        password: hashedPassword,
      });
      const saved = await this.buildingSpotRepository.save(entity);
      return this.toResponseDto(saved);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'El usuario con este correo electrónico o teléfono ya se encuentra registrado',
        );
      }
      throw new InternalServerErrorException('Error al crear la cuenta');
    }
  }

  async findAll(): Promise<BsResponseDto[]> {
    try {
      const items = await this.buildingSpotRepository.find();
      return items.map((item) => this.toResponseDto(item));
    } catch {
      throw new InternalServerErrorException('Error fetching building spots');
    }
  }

  async findOneByEmail(email: string): Promise<BsResponseDto> {
    try {
      const buildingSpot = await this.buildingSpotRepository.findOne({
        where: { email },
      });

      if (!buildingSpot) {
        throw new NotFoundException('Building spot not found');
      }

      return this.toResponseDto(buildingSpot);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Error fetching building spot by email',
      );
    }
  }

  async findOne(id: number): Promise<BsResponseDto> {
    try {
      const buildingSpot = await this.buildingSpotRepository.findOne({
        where: { id },
      });

      if (!buildingSpot) {
        throw new NotFoundException('Building spot not found');
      }

      return this.toResponseDto(buildingSpot);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error fetching building spot');
    }
  }

  async replace(id: number, updateBsDto: UpdateBsDto): Promise<BsResponseDto> {
    try {
      const existing = await this.buildingSpotRepository.findOne({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Building spot not found');
      }

      const { password, ...data } = updateBsDto;
      const payload: Partial<BuildingSpot> = { ...data, id };

      if (password) {
        payload.password = await bcryptjs.hash(password, 10);
      }

      const replaced = this.buildingSpotRepository.create(payload);
      const saved = await this.buildingSpotRepository.save(replaced);
      return this.toResponseDto(saved);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error replacing building spot');
    }
  }

  async update(id: number, updateBsDto: UpdateBsDto): Promise<BsResponseDto> {
    try {
      const existing = await this.buildingSpotRepository.findOne({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException('Building spot not found');
      }

      const { password, ...data } = updateBsDto;
      const updated = this.buildingSpotRepository.merge(existing, data);

      if (password) {
        updated.password = await bcryptjs.hash(password, 10);
      }

      const saved = await this.buildingSpotRepository.save(updated);
      return this.toResponseDto(saved);
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

  private toResponseDto(entity: BuildingSpot): BsResponseDto {
    return new BsResponseDto({
      name: entity.name,
      address: entity.address,
      phone: entity.phone,
      email: entity.email,
      municipalityId: entity.municipalityId,
    });
  }
}
