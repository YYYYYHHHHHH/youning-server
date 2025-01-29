import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ProjectReport } from '../project-report/project-report.entity';
import { Person } from '../person/person.entity';

@Entity()
export class ProjectReportPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => ProjectReport)
  projectReport!: ProjectReport;

  @ManyToOne(() => Person)
  person!: Person;

  @Column('date')
  gateDate!: Date;
} 