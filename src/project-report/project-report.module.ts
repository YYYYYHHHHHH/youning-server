import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReport } from './project-report.entity';
import { ProjectReportService } from './project-report.service';
import { ProjectReportController } from './project-report.controller';
import { Project } from '../project/project.entity';
import { Person } from '../person/person.entity';
import { ProjectModule } from '../project/project.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectReport, Project, Person]),
    ProjectModule,
    PersonModule,
  ],
  providers: [ProjectReportService],
  controllers: [ProjectReportController],
  exports: [TypeOrmModule],
})
export class ProjectReportModule {} 