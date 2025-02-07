import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from '../person/person.entity';
import { Project } from '../project/project.entity';

@Entity()
export class ProjectReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Person)
  @JoinColumn()
  createBy!: Person;

  @Column({ length: 500, nullable: true })
  remark?: string;

  @Column('datetime')
  createTime!: Date;

  @ManyToOne(() => Project)
  @JoinColumn()
  project!: Project;
}
