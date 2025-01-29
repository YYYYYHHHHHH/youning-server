import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 150 })
  icon!: string;

  @Column({ length: 100 })
  unit!: string;

  @Column('datetime')
  createTime!: Date;

  @Column()
  createBy!: number;
} 