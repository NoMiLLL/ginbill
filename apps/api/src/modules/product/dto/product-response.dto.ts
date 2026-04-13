import { Exclude, Expose } from 'class-transformer';

export class ResponseProductDto {
  @Exclude()
  id: number;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  unitsOfMeasurement: number;

  @Expose()
  codigoEstandar: number;

  @Expose()
  referenceCode: string;

  @Expose()
  taxRate: number;

  @Expose()
  isExcluded: boolean;

  constructor(partial: Partial<ResponseProductDto>) {
    Object.assign(this, partial);
  }
}
