import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: true })
  mediaType: string;

  @Column({ length: 200, nullable: true })
  uri: string;

  @Column('datetime', { nullable: true })
  createTime: Date;

  @Column({ length: 200, nullable: true })
  location: string;
} 