import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity('building_spot')
export class BuildingSpot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 120,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'address',
    type: 'varchar',
    length: 200,
    nullable: false,
  })
  address: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  phone: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 120,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 72,
    nullable: true,
  })
  password: string;

  @Column({
    name: 'municipality_id',
    type: 'varchar',
    nullable: false,
  })
  municipalityId: string;

  @OneToMany(() => Customer, (customer) => customer.bs)
  customers: Customer[];

  @OneToMany(() => Product, (product) => product.bs)
  products: Product[];

  @OneToMany(() => Invoice, (invoice) => invoice.bs)
  invoices: Invoice[];
}
