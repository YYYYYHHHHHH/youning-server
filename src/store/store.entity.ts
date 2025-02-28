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

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn()
  project?: Project;

  @ManyToOne(() => Media, { nullable: true })
  @JoinColumn()
  media?: Media;
}
