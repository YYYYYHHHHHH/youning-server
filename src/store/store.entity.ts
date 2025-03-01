import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';
import { StoreMaterial } from '../store-material/store-material.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';

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

  @OneToMany(() => StoreMaterial, (storeMaterial) => storeMaterial.store)
  materials?: StoreMaterial[];

  @OneToMany(() => StoreHistoryRecord, (historyRecord) => historyRecord.store)
  historyRecords?: StoreHistoryRecord[];
}
