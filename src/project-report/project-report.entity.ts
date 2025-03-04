import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Person } from '../person/person.entity';
import { Project } from '../project/project.entity';
import { ProjectReportMedia } from '../project-report-media/project-report-media.entity';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';

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

  // 在实体关系中设置了eager: true时，每次查询主实体时都会自动加载这个关联关系，不需要显式指定relations。
  @OneToMany(() => ProjectReportMedia, (media) => media.projectReport, { eager: true })
  projectReportMedias?: ProjectReportMedia[];

  @OneToMany(() => ProjectReportPerson, (person) => person.projectReport)
  projectReportPersons?: ProjectReportPerson[];

  storeHistoryRecords?: StoreHistoryRecord[];
}
