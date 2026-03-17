import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsInt()
  @Min(1)
  unitsOfMeasurement: number;

  @IsInt()
  @Min(1)
  codigoEstandar: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  referenceCode: string;
}
