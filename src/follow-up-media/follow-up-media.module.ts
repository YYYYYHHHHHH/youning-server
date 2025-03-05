import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUpMedia } from './follow-up-media.entity';
import { FollowUpMediaService } from './follow-up-media.service';
import { FollowUpMediaController } from './follow-up-media.controller';
import { FollowUp } from '../follow-up/follow-up.entity';
import { Media } from '../media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUpMedia, FollowUp, Media])],
  providers: [FollowUpMediaService],
  controllers: [FollowUpMediaController],
  exports: [FollowUpMediaService],
})
export class FollowUpMediaModule {}