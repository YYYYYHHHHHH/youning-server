import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { WorkDays } from './project-report-person.enum';
import { ProjectReport } from '../project-report/project-report.entity';
import { Person } from '../person/person.entity';

@Entity()
export class ProjectReportPerson {
  @PrimaryGeneratedColumn()
  id!: number;

  // 当项目报告被删除时级联删除相关记录
  @ManyToOne(() => ProjectReport, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  projectReport!: ProjectReport;

  // 人员被删除时级联删除相关记录
  @ManyToOne(() => Person, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  person!: Person;

  @Column('enum', { enum: WorkDays })
  workDays!: WorkDays;

  @Column('int')
  extraHours!: number;
}
