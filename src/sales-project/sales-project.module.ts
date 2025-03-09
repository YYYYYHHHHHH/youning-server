import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesProjectController } from './sales-project.controller';
import { SalesProjectService } from './sales-project.service';
import { SalesProject } from './sales-project.entity';
import { Person } from '../person/person.entity';
import { Media } from '../media/media.entity';
import { FollowUp } from '../follow-up/follow-up.entity';
import { FollowUpModule } from '../follow-up/follow-up.module';

@Module({
  imports: [TypeOrmModule.forFeature([SalesProject, Person, Media, FollowUp]), FollowUpModule],
  controllers: [SalesProjectController],
  providers: [SalesProjectService],
  exports: [SalesProjectService],
})
export class SalesProjectModule {}