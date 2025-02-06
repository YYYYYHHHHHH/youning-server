import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => Media)
  @JoinColumn()
  icon!: Media;

  @Column({ length: 100 })
  unit!: string;

  @Column('datetime')
  createTime!: Date;

  @ManyToOne(() => Person)
  @JoinColumn()
  createBy!: Person;
}
