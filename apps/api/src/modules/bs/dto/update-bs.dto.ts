import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBsDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  address?: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  @Transform(({ value }) => value.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  municipalityId?: number;
}
