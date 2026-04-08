import { Expose, Exclude } from 'class-transformer';

export class BsResponseDto {
  @Exclude()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phone: string;

  @Expose()
  email: string;

  @Expose()
  municipalityId: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<BsResponseDto>) {
    Object.assign(this, partial);
  }
}
