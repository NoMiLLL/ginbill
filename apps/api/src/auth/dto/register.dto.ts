import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsPhoneNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value.trim())
  address: string;

  @IsNotEmpty()
  @IsPhoneNumber('CO')
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsInt()
  @Min(1)
  municipalityId: number;
}
