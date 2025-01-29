import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, nullable: true })
  name?: string;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column('datetime', { nullable: true })
  startTime?: Date;

  @Column('datetime', { nullable: true })
  endTime?: Date;

  @Column({ length: 150, nullable: true })
  icon?: string;

  @Column('datetime', { nullable: true })
  createTime?: Date;

  @Column({ nullable: true })
  createBy?: number;
}
