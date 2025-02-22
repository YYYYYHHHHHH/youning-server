import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { ProjectReport } from '../project-report/project-report.entity';
import { Person } from '../person/person.entity';

@Entity()
export class ProjectReportPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProjectReport)
  @JoinColumn()
  projectReport!: ProjectReport;

  @ManyToOne(() => Person)
  @JoinColumn()
  person!: Person;

  @Column('decimal', { precision: 2, scale: 1 })
  workDays!: number;

  @Column('int')
  extraHours!: number;

  @Column('date')
  gateDate!: Date;
}
