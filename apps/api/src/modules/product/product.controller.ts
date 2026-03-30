import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { ActiveBs } from 'src/common/decorators/active-bs.decorator';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @ActiveBs() bs: any) {
    return this.productService.create(createProductDto, bs.id);
  }

  @Get()
  findAll(@ActiveBs() bs: any) {
    return this.productService.findAll(bs.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @ActiveBs() bs: any) {
    return this.productService.findOne(id, bs.id);
  }

  @Put(':id')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @ActiveBs() bs: any,
  ) {
    return this.productService.replace(id, updateProductDto, bs.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @ActiveBs() bs: any,
  ) {
    return this.productService.update(id, updateProductDto, bs.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @ActiveBs() bs: any) {
    return this.productService.remove(id, bs.id);
  }
}
