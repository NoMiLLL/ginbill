import { IsNumber, IsOptional, IsPositive, IsString, MaxLength, IsInt } from 'class-validator';

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
}
