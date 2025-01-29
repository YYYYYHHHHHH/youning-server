import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100 })
  tel!: string;

  @Column({ length: 150, nullable: true })
  icon?: string;

  @Column({ length: 50 })
  identityId!: string;

  @Column({ length: 100, nullable: true })
  authority?: string;

  @Column('datetime')
  createTime?: Date;

  @Column({ nullable: true })
  createBy?: number;
}
