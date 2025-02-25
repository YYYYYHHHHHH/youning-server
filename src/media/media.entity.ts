import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../person/person.entity';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, nullable: true })
  mediaType?: string;

  @Column({ length: 200, nullable: true })
  uri?: string;

  @Column('datetime', { nullable: true })
  createTime?: Date;

  // @Column({ length: 200, nullable: true })
  // location?: string;

  @Column({ length: 500, nullable: true })
  originalName?: string;

  @ManyToOne(() => Person)
  @JoinColumn()
  createBy?: Person;
}
