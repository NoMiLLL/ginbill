import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BsModule } from './modules/bs/bs.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CustomerModule } from './modules/customer/customer.module';
import { InvoiceModule } from './modules/invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.database_url,
      autoLoadEntities: true,
      synchronize: true,
    }),
    BsModule,
    AuthModule,
    ProductModule,
    CustomerModule,
    InvoiceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
