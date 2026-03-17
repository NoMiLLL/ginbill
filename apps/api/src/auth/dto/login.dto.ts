import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEmail } from "class-validator";

export class LoginDto {

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
}