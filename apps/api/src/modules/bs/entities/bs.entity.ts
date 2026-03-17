import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('building_spot')
export class BuildingSpot {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'b_s_name',
        type: 'varchar',
        length: 120
    })
    name: string;

    @Column({
        name: 'b_s_address',
        type: 'varchar',
        length: 200
    })
    address: string;

    @Column({
        name: 'b_s_phone',
        type: 'varchar',
        length: 20,
        unique: true
    })
    phone: string;

    @Column({
        name: 'b_s_email',
        type: 'varchar',
        length: 120,
        unique: true
    })
    email: string;

    @Column({
        name: 'b_s_password',
        type: 'varchar',
        length: 72
    })
    password: string;

    @Column({
        name: 'b_s_municipality_id',
        type: 'int'
    })
    municipalityId: number;

    @OneToMany(() => Customer, (customer) => customer.bs)
    customers: Customer[];

    @OneToMany(() => Product, (product) => product.bs)
    products: Product[];

}
