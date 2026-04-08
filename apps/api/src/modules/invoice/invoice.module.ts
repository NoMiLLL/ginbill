import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from './entities/invoice.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FactusMapperService } from './factus-mapper.service';
import { Product } from '../product/entities/product.entity';
import { BuildingSpot } from '../bs/entities/bs.entity';
import { Customer } from '../customer/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Product, BuildingSpot, Customer]),
    AuthModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService, FactusMapperService],
  exports: [InvoiceService, FactusMapperService],
})
export class InvoiceModule {}
