import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';

@Entity()
export class StoreHistoryRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('datetime')
  time: Date;

  @ManyToOne(() => Store)
  store: Store;

  @ManyToOne(() => Person)
  person: Person;

  @Column()
  changeType: number;
} 