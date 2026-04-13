import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BuildingSpot } from '../../bs/entities/bs.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name: string;

  /**
   * ADVERTENCIA DE MIGRACIÓN:
   * Al implementar el modelo "Tax Exclusive", es necesario ejecutar un script SQL 
   * para dividir los precios actuales entre (1 + taxRate/100) si se desea 
   * mantener el precio final histórico al público.
   * Ejemplo: UPDATE product SET price = price / 1.19;
   */
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 4,
  })
  price: number;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 19.00,
  })
  taxRate: number;

  @Column({
    name: 'is_excluded',
    type: 'boolean',
    default: false,
  })
  isExcluded: boolean;

  @Column({
    name: 'units_of_measurement',
    type: 'int',
  })
  unitsOfMeasurement: number;

  @Column({
    name: 'codigo_estandar',
    type: 'int',
  })
  codigoEstandar: number;

  @Column({
    name: 'reference_code',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  referenceCode: string;

  @ManyToOne(() => BuildingSpot, (bs) => bs.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bs_id' })
  bs: BuildingSpot;
}
