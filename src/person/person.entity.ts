import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  tel!: string;

  @Column({ type: 'varchar', length: 100 })
  bankCard!: string;

  @Column({ type: 'varchar', length: 50 })
  identityId!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 100 })
  authority!: string;

  @Column({ type: 'datetime' })
  createTime!: Date;

  @Column({ type: 'int', nullable: true })
  createBy?: number;
}
