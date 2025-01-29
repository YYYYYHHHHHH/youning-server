import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';

@Entity()
export class StoreMaterial {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Store)
  store!: Store;

  @ManyToOne(() => Material)
  material!: Material;
} 