import { Expose, Exclude } from 'class-transformer';

export class ResponseCustomerDto {

    @Exclude()
    id: number;

    @Expose()
    identification: string;

    @Expose()
    names: string;

    @Expose()
    address: string;

    @Expose()
    email: string;

    @Expose()
    phone: string;

    @Expose()
    municipalityId: number;

    constructor(partial: Partial<ResponseCustomerDto>) {
        Object.assign(this, partial);
    }
}
