import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ResponseProductDto } from './dto/product-response.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, bsId: number) {
    try {
      const entity = this.productRepository.create({
        ...createProductDto,
        bs: { id: bsId },
      });
      return await this.productRepository.save(entity);
    } catch {
      throw new InternalServerErrorException('Error creating product');
    }
  }

  async findAll(bsId: number) {
    try {
      return await this.productRepository.find({
        where: { bs: { id: bsId } },
      });
    } catch {
      throw new InternalServerErrorException('Error fetching products');
    }
  }

  private async findEntity(id: number, bsId: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id, bs: { id: bsId } },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error fetching product');
    }
  }

  async findOne(id: number, bsId: number): Promise<ResponseProductDto> {
    const product = await this.findEntity(id, bsId);
    return new ResponseProductDto(product);
  }

  async replace(id: number, updateProductDto: UpdateProductDto, bsId: number) {
    try {
      const existing = await this.findEntity(id, bsId); // Verifica propiedad

      const replaced = this.productRepository.create({
        ...existing,
        ...updateProductDto,
        id,
        bs: { id: bsId },
      });
      return await this.productRepository.save(replaced);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error replacing product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto, bsId: number) {
    try {
      const existing = await this.findEntity(id, bsId); // Verifica propiedad

      const updated = this.productRepository.merge(existing, updateProductDto);
      return await this.productRepository.save(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error updating product');
    }
  }

  async remove(id: number, bsId: number) {
    try {
      const existing = await this.findEntity(id, bsId); // Verifica propiedad
      await this.productRepository.remove(existing);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Error deleting product');
    }
  }
}
