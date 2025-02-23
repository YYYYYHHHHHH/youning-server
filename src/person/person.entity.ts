import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Media } from '../media/media.entity';
import { Authority } from './person.enum';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 100 })
  password!: string;

  @Column({
    type: 'enum',
    enum: Authority,
    comment:
      '权限：SALES-销售,SITE_MANAGER-工地负责人,WORKER-工人,ADMIN-管理员',
  })
  authority!: Authority;

  @Column({ length: 20, unique: true, comment: '手机号，用于登录' })
  phone!: string;

  @ManyToOne(() => Media)
  @JoinColumn()
  icon?: Media;

  @Column({ length: 500, nullable: true })
  remark?: string;
}
