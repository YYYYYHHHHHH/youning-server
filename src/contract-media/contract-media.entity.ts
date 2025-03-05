import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contract/contract.entity';
import { Media } from '../media/media.entity';

@Entity('contract_media')
export class ContractMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  createTime: Date;

  @ManyToOne(() => Contract, contract => contract.contractMedias)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'media_id' })
  media: Media;
}