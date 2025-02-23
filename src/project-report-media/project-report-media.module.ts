import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReportMedia } from './project-report-media.entity';
import { ProjectReportMediaService } from './project-report-media.service';
import { ProjectReportMediaController } from './project-report-media.controller';
import { ProjectReport } from '../project-report/project-report.entity';
import { Media } from '../media/media.entity';
import { ProjectReportModule } from '../project-report/project-report.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectReportMedia, ProjectReport, Media]),
    ProjectReportModule,
    MediaModule,
  ],
  providers: [ProjectReportMediaService],
  controllers: [ProjectReportMediaController],
  exports: [TypeOrmModule],
})
export class ProjectReportMediaModule {}
