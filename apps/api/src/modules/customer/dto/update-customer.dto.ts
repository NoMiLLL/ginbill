import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  identification?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  names?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Transform(({ value }) => value.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => value.trim())
  phone?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  municipalityId?: number;
}
