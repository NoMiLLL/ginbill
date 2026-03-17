import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BuildingSpot } from '../../bs/entities/bs.entity';

@Entity('customer')
export class Customer {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true
    })
    identification: string;

    @Column({
        type: 'varchar',
        length: 150
    })
    names: string;

    @Column({
        type: 'varchar',
        length: 200
    })
    address: string;

    @Column({
        type: 'varchar',
        length: 120
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 20
    })
    phone: string;

    @Column({
        name: 'municipality_id',
        type: 'int'
    })
    municipalityId: number;

    @ManyToOne(() => BuildingSpot, (bs) => bs.customers, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'bs_id' })
    bs: BuildingSpot;

}