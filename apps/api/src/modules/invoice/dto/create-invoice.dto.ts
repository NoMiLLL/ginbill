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
} from 'class-validator';

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

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
