import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { SalesProject } from '../sales-project/sales-project.entity';
import { ContractMedia } from '../contract-media/contract-media.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  partyAName: string;

  @Column({ length: 20 })
  partyAPhone: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  contractAmount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ length: 50 })
  signatory: string;

  @Column({ length: 200 })
  constructionSite: string;

  @Column({ type: 'date' })
  signingTime: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => SalesProject, salesProject => salesProject.contracts)
  @JoinColumn({ name: 'sales_project_id' })
  salesProject: SalesProject;

  @OneToMany(() => ContractMedia, contractMedia => contractMedia.contract)
  contractMedias: ContractMedia[];
}