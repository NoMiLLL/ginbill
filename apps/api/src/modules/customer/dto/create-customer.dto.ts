import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  identification: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  names: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  address: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value.trim())
  phone: string;

  @IsInt()
  @IsPositive()
  municipalityId: number;
}
