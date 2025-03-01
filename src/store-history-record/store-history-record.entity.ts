import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { ProjectReport } from '../project-report/project-report.entity';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';
import { Material } from '../material/material.entity';
import { ChangeType } from './store-history-record.enum';

@Entity()
export class StoreHistoryRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('datetime')
  time!: Date;

  @ManyToOne(() => Store)
  @JoinColumn()
  store!: Store;

  @ManyToOne(() => Person)
  @JoinColumn()
  person!: Person;

  @Column({
    type: 'enum',
    enum: ChangeType,
    comment: '变动类型：1-调拨入库，2-调拨出库，3-采购入库，4-消耗出库',
  })
  changeType!: ChangeType;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn()
  fromStore?: Store;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn()
  toStore?: Store;

  @ManyToOne(() => Material, { nullable: false })
  @JoinColumn()
  material!: Material;

  @Column('decimal', { precision: 10, scale: 2 })
  count!: number;

  // 定义与项目日报的多对一关系
  // nullable: true 表示这个关联可以为空，因为可能不是每日日报消耗的
  @ManyToOne(() => ProjectReport, { nullable: true })
  @JoinColumn()
  projectReport?: ProjectReport;

  // 单独存储日报ID的列
  // @RelationId 装饰器会自动从 projectReport 关系中提取 ID 值
  // 这样可以直接获取 ID 而不需要加载整个日报对象
  @Column({ nullable: true, comment: '关联的项目日报 id' })
  @RelationId((record: StoreHistoryRecord) => record.projectReport)
  projectReportId?: number;
}
