import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';

@Entity()
export class StoreMaterial {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Store)
  @JoinColumn()
  store!: Store;

  @ManyToOne(() => Material)
  @JoinColumn()
  material!: Material;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: '当前库存量',
  })
  currentStock!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: '库存预警阈值',
  })
  warningThreshold!: number;
}
