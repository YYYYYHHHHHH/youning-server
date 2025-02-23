import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReportPerson } from './project-report-person.entity';
import { ProjectReportPersonService } from './project-report-person.service';
import { ProjectReportPersonController } from './project-report-person.controller';
import { ProjectReport } from '../project-report/project-report.entity';
import { Person } from '../person/person.entity';
import { ProjectReportModule } from '../project-report/project-report.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectReportPerson, ProjectReport, Person]),
    ProjectReportModule,
    PersonModule,
  ],
  providers: [ProjectReportPersonService],
  controllers: [ProjectReportPersonController],
  exports: [TypeOrmModule],
})
export class ProjectReportPersonModule {}
