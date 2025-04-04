import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { ProjectStatus } from './project.enum';
import { ProjectMediaRelation } from '../project-media-relation/project-media-relation.entity';
import { SalesProject } from '../sales-project/sales-project.entity';

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

  @ManyToOne(() => Media)
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

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.IN_PROGRESS })
  status!: ProjectStatus;

  @Column({ type: 'varchar', length: 12, nullable: true })//12 位电话号码的原因是包含区号的座机号码
  clientPhone?: string;

  @ManyToOne(() => SalesProject, { nullable: true })
  @JoinColumn({ name: 'salesProjectId' })
  salesProject?: SalesProject;

  @Column({ nullable: true })
  salesProjectId?: number;

  @OneToMany(() => ProjectMediaRelation, (relation: ProjectMediaRelation) => relation.project)
  projectMediaRelations?: ProjectMediaRelation[];
}
