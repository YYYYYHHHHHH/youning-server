import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SalesProject } from '../sales-project/sales-project.entity';
import { FollowUpMedia } from '../follow-up-media/follow-up-media.entity';
import { Progress } from './follow-up.enum';
import { Person } from '../person/person.entity';

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

  @ManyToOne(() => SalesProject, salesProject => salesProject.followUps, { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'sales_project_id' })
  salesProject: SalesProject;

  @Column({ nullable: true })
  createById: number;
  
  /**
 * 多对一关系：跟进记录与创建人
 * onDelete: 'SET NULL' - 当关联的人员被删除时，此字段设为NULL
 * onUpdate: 'CASCADE' - 当关联的人员ID更新时，此字段自动更新
 */
  @ManyToOne(() => Person, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'createById' })
  createBy: Person;

  @OneToMany(() => FollowUpMedia, followUpMedia => followUpMedia.followUp)
  followUpMedias: FollowUpMedia[];
}