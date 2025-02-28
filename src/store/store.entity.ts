import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  // 在删除项目工地时，相关的仓库记录会被保留，且其project字段会自动设置为null
  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project?: Project;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn()
  media?: Media;
}
