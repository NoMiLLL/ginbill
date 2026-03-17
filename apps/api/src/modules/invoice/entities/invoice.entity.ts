import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BuildingSpot } from '../../bs/entities/bs.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('invoice')
export class Invoice {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'decimal',
        precision: 15,
        scale: 2,
        default: 0
    })
    total: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true
    })
    description: string;

    @CreateDateColumn({
        name: 'created_at'
    })
    createdAt: Date;

    @ManyToOne(() => BuildingSpot, (bs) => bs.invoices, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'bs_id' })
    bs: BuildingSpot;

    @ManyToOne(() => Customer, (customer) => customer.invoices, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

}
