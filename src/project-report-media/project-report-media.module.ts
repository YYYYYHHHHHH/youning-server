import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReportMedia } from './project-report-media.entity';
import { ProjectReportMediaService } from './project-report-media.service';
import { ProjectReportMediaController } from './project-report-media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectReportMedia])],
  providers: [ProjectReportMediaService],
  controllers: [ProjectReportMediaController],
})
export class ProjectReportMediaModule {} 