import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUp } from './follow-up.entity';
import { FollowUpService } from './follow-up.service';
import { FollowUpController } from './follow-up.controller';
import { SalesProject } from '../sales-project/sales-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUp, SalesProject])],
  providers: [FollowUpService],
  controllers: [FollowUpController],
  exports: [FollowUpService],
})
export class FollowUpModule {}