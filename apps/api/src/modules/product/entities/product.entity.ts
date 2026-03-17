import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BuildingSpot } from '../../bs/entities/bs.entity';

@Entity('product')
export class Product {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 150
    })
    name: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2
    })
    price: number;

    @Column({
        name: 'units_of_measurement',
        type: 'int'
    })
    unitsOfMeasurement: number;

    @Column({
        name: 'codigo_estandar',
        type: 'int'
    })
    codigoEstandar: number;

    @Column({
        name: 'reference_code',
        type: 'varchar',
        length: 50,
        unique: true
    })
    referenceCode: string;

    @ManyToOne(() => BuildingSpot, (bs) => bs.products, {
        nullable: false,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'bs_id' })
    bs: BuildingSpot;

}