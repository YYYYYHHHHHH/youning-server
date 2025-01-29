import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReport } from './project-report.entity';
import { ProjectReportService } from './project-report.service';
import { ProjectReportController } from './project-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectReport])],
  providers: [ProjectReportService],
  controllers: [ProjectReportController],
})
export class ProjectReportModule {} 