import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';
import { StoreMaterial } from '../store-material/store-material.entity';

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

  @Column({ type: 'varchar', length: 500, nullable: true })
  remark?: string;

  // 虚拟字段，不会存入数据库
  projectWorkerTimeRecords?: ProjectReportPerson[]; // 工人工时记录
  materialConsumptionRecords?: StoreHistoryRecord[]; // 物料消耗记录
  currentMaterialStock?: StoreMaterial[]; // 当前物料库存
}
