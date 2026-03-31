import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BuildingSpot } from '../../bs/entities/bs.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'int',
    name: 'numbering_range_id',
    nullable: false,
    default: 1,
  })
  numberingRangeId: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'reference_code',
    nullable: false,
    default: 'REF-000',
  })
  referenceCode: string;

  @Column({
    type: 'text',
    nullable: true, // Cambiado a true para permitir el arranque
  })
  observation: string;

  @Column({
    type: 'varchar',
    length: 1,
    name: 'payment_form',
    nullable: false,
    default: '1',
  })
  paymentForm: string;

  @Column({
    type: 'varchar',
    length: 5,
    name: 'payment_method_code',
    nullable: false,
    default: '10',
  })
  paymentMethodCode: string;

  @Column({
    type: 'date',
    name: 'payment_due_date',
    nullable: true,
  })
  paymentDueDate: Date;

  @Column({
    type: 'date',
    name: 'start_date',
    nullable: true, // Cambiado a true para permitir el arranque
  })
  startDate: Date;

  @Column({
    type: 'date',
    name: 'end_date',
    nullable: true, // Cambiado a true para permitir el arranque
  })
  endDate: Date;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  total: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true, // Cambiado a true para permitir el arranque
  })
  description: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => BuildingSpot, (bs) => bs.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bs_id' })
  bs: BuildingSpot;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
