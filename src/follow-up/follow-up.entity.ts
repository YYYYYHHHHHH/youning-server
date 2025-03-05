import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SalesProject } from '../sales-project/sales-project.entity';
import { FollowUpMedia } from '../follow-up-media/follow-up-media.entity';
import { Progress } from './follow-up.enum';

@Entity('follow_up')
export class FollowUp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Progress,
    enumName: 'progress_enum'
  })
  progress: Progress;

  @Column({ length: 255 })
  remark: string;

  @Column({ type: 'timestamp' })
  followUpTime: Date;

  @ManyToOne(() => SalesProject, salesProject => salesProject.followUps)
  @JoinColumn({ name: 'sales_project_id' })
  salesProject: SalesProject;

  @OneToMany(() => FollowUpMedia, followUpMedia => followUpMedia.followUp)
  followUpMedias: FollowUpMedia[];
}