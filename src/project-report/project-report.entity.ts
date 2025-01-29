import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Person } from '../person/person.entity';
import { Project } from '../project/project.entity';

@Entity()
export class ProjectReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Person)
  person!: Person;

  @Column({ length: 500, nullable: true })
  remark?: string;

  @Column('datetime')
  createTime!: Date;

  @ManyToOne(() => Project)
  project!: Project;
} 