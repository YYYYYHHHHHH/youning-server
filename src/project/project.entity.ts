import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string;

  @Column({ type: 'datetime', nullable: true })
  startTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime?: Date;

  @OneToOne(() => Media)
  @JoinColumn({ name: 'mediaId' })
  media?: Media;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'managerId' })
  manager?: Person;

  @ManyToOne(() => Person)
  @JoinColumn({ name: 'createById' })
  createBy?: Person;

  @Column({ type: 'datetime' })
  createTime!: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remark?: string;
}
