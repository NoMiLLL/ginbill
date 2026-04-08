import { Exclude, Expose, Type } from 'class-transformer';

export class CustomerResponseDto {
  @Exclude()
  id: number;

  @Expose()
  email: string;

  @Expose()
  names: string;

  @Expose()
  phone: string;

  @Expose()
  address: string;

  @Expose()
  tribute_id: number;

  @Expose()
  identification: string;

  @Expose()
  municipality_id: number;

  @Expose()
  legal_organization_id: number;

  @Expose()
  identification_document_id: number;
}

export class BillingPeriodResponseDto {
  @Expose()
  start_date: string;

  @Expose()
  start_time: string;

  @Expose()
  end_date: string;

  @Expose()
  end_time: string;
}

export class EstablishmentResponseDto {
  @Expose()
  name: string;

  @Expose()
  address: string;

  @Expose()
  phone_number: string;

  @Expose()
  email: string;

  @Expose()
  municipality_id: string;
}

export class ItemResponseDto {
  @Expose()
  code_reference: string;

  @Expose()
  name: string;

  @Expose()
  quantity: number;

  @Expose()
  discount_rate: number;

  @Expose()
  price: number;

  @Expose()
  tax_rate: string;

  @Expose()
  unit_measure_id: number;

  @Expose()
  standard_code_id: number;

  @Expose()
  is_excluded: number;

  @Expose()
  tribute_id: number;

  @Expose()
  withholding_taxes: any[];
}

export class InvoiceResponseDto {
  @Exclude()
  id: number;

  @Expose()
  numbering_range_id: number;

  @Expose()
  reference_code: string;

  @Expose()
  observation: string;

  @Expose()
  payment_form: string;

  @Expose()
  payment_due_date?: string;

  @Expose()
  payment_method_code: string;

  @Expose()
  total: number;

  @Expose()
  description: string;

  @Expose()
  @Type(() => ItemResponseDto)
  items: ItemResponseDto[];

  @Expose()
  @Type(() => CustomerResponseDto)
  customer: CustomerResponseDto;

  @Expose()
  @Type(() => EstablishmentResponseDto)
  establishment: EstablishmentResponseDto;

  @Expose()
  @Type(() => BillingPeriodResponseDto)
  billing_period: BillingPeriodResponseDto;
}
