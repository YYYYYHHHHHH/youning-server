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

  @OneToMany(() => ProjectReportMedia, (media) => media.projectReport)
  projectReportMedias?: ProjectReportMedia[];
}
