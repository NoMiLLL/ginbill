import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BsService } from 'src/modules/bs/bs.service';
import { RegisterDto } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly bsService: BsService,
    private jwtService: JwtService,
  ) {}

  async register({
    name,
    email,
    address,
    phone,
    password,
    municipalityId,
  }: RegisterDto) {
    try {
      const bs = await this.bsService.findOneByEmail(email);
      if (bs) {
        throw new BadRequestException('user already exists');
      }
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    return await this.bsService.create({
      name,
      email,
      address,
      phone,
      password, // Pasamos el password sin hashear porque BsService.create se encarga de ello
      municipalityId,
    });
  }

  async login({ email, password }: LoginDto) {
    const bs = await this.bsService.findByEmailForAuth(email);
    if (!bs) {
      throw new UnauthorizedException('El correo electrónico no está registrado');
    }
    const isPasswordValid = await bcryptjs.compare(password, bs.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    const payload = { email: bs.email, sub: bs.id };
    const token = await this.jwtService.signAsync(payload);
    return {
      token,
      email,
    };
  }
}
