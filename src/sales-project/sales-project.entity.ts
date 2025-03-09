import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Person } from '../person/person.entity';
import { Media } from '../media/media.entity';
import { Contract } from '../contract/contract.entity';
import { FollowUp } from '../follow-up/follow-up.entity';
import { ProjectPhoto } from '../project-photos/project-photo.entity';
import { Progress } from '../follow-up/follow-up.enum';

@Entity('sales_project')
export class SalesProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  projectName: string;

  @Column({ length: 100 })
  customerName: string;

  @Column({ length: 20 })
  contactNumber: string;

  @Column({ length: 255 })
  site: string;

  @Column({ type: 'datetime' })
  createTime: Date;

  @ManyToOne(() => Person, { eager: true })
  @JoinColumn({ name: 'salesman_id' })
  salesman: Person;

  @ManyToOne(() => Media, { eager: true })
  @JoinColumn({ name: 'media_id' })
  media: Media;

  @OneToMany(() => Contract, contract => contract.salesProject)
  contracts: Contract[];

  @OneToMany(() => FollowUp, followUp => followUp.salesProject)
  followUps: FollowUp[];

  @OneToMany(() => ProjectPhoto, projectPhoto => projectPhoto.salesProject)
  projectPhotos: ProjectPhoto[];

  @Exclude()
  updateTime?: Date | null;
}