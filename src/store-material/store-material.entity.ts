import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  Index
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';

// 为StoreMaterial实体添加了唯一性约束，确保了每个仓库和材料的组合在数据库中是唯一的,不能创建多条相同材料的库存信息。
@Entity()
@Index(['store', 'material'], { unique: true })
export class StoreMaterial {
  @PrimaryGeneratedColumn()
  id!: number;

  // store => store.materials 指定反向关系，即在 Store 实体中通过 materials 属性访问
  @ManyToOne(() => Store, store => store.materials)
  @JoinColumn()
  store!: Store;

  @ManyToOne(() => Material)
  @JoinColumn()
  material!: Material;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: '当前库存量',
  })
  currentStock!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    comment: '库存预警阈值',
    nullable: true,
  })
  warningThreshold!: number | null;
}
