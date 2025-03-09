import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FollowUp } from '../follow-up/follow-up.entity';
import { Media } from '../media/media.entity';

@Entity('follow_up_media')
export class FollowUpMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FollowUp, followUp => followUp.followUpMedias)
  @JoinColumn({ name: 'follow_up_id' })
  followUp: FollowUp;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'media_id' })
  media: Media;
}