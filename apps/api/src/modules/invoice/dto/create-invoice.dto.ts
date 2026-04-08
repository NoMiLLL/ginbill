import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  IsInt,
  IsEnum,
  IsDateString,
  ValidateIf,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentForm {
  CONTADO = '1',
  CREDITO = '2',
}

export enum PaymentMethodCode {
  EFECTIVO = '10',
  CHEQUE = '20',
  CONSIGNACION = '42',
  TRANSFERENCIA = '47',
  TARJETA_CREDITO = '48',
  TARJETA_DEBITO = '49',
  OTRO = 'ZZ',
}

export class InvoiceItemSnapshotDto {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  unit_price: number;

  @IsNumber()
  tax_rate: number;

  @IsString()
  tax_name: string;

  @IsOptional()
  @IsNumber()
  discount_rate?: number;
}

export class CreateInvoiceDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsInt()
  @IsPositive()
  customerId: number;

  @IsInt()
  numberingRangeId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  referenceCode?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsEnum(PaymentForm)
  paymentForm: PaymentForm;

  @IsEnum(PaymentMethodCode)
  paymentMethodCode: PaymentMethodCode;

  @ValidateIf((o: CreateInvoiceDto) => o.paymentForm === PaymentForm.CREDITO)
  @IsDateString()
  paymentDueDate?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemSnapshotDto)
  items: InvoiceItemSnapshotDto[];
}
