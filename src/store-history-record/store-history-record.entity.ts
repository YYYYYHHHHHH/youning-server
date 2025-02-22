import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';
import { Material } from '../material/material.entity';
import { ChangeType } from './store-history-record.enum';

@Entity()
export class StoreHistoryRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('datetime')
  time!: Date;

  @ManyToOne(() => Store)
  @JoinColumn()
  store!: Store;

  @ManyToOne(() => Person)
  @JoinColumn()
  person!: Person;

  @Column({
    type: 'enum',
    enum: ChangeType,
    comment: '变动类型：1-调拨入库，2-调拨出库，3-采购入库，4-消耗出库',
  })
  changeType!: ChangeType;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn()
  fromStore?: Store;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn()
  toStore?: Store;

  @ManyToOne(() => Material)
  @JoinColumn()
  material!: Material;

  @Column('decimal', { precision: 10, scale: 2 })
  count!: number;
}
