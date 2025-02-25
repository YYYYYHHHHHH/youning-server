import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
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

  @Column({
    length: 11,
    nullable: false,
    unique: true,
    comment: '手机号，用于登录',
  })
  phone!: string;

  @Column({
    length: 18,
    nullable: false,
    unique: true,
    comment: '身份证号',
    default: '',
  })
  idCard!: string;

  @OneToOne(() => Media, { nullable: false })
  @JoinColumn()
  icon!: Media;

  @Column({
    length: 19,
    nullable: true,
    comment: '银行卡号',
  })
  bankCard?: string;

  @Column({ type: 'datetime', nullable: false })
  create_time!: Date;

  @Column({ nullable: false })
  createById!: number;
  // @ManyToOne(() => Person, { nullable: false })
  // @JoinColumn()
  // createBy!: Person;
}
