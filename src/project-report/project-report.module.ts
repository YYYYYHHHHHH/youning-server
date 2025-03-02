import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReport } from './project-report.entity';
import { ProjectReportService } from './project-report.service';
import { ProjectReportController } from './project-report.controller';
import { Project } from '../project/project.entity';
import { Person } from '../person/person.entity';
import { ProjectModule } from '../project/project.module';
import { PersonModule } from '../person/person.module';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { Store } from '../store/store.entity';
import { StoreMaterial } from '../store-material/store-material.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';
import { Media } from '../media/media.entity';
import { ProjectReportMedia } from '../project-report-media/project-report-media.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectReport,
      Project,
      Person,
      ProjectReportPerson,
      Store,
      StoreMaterial,
      StoreHistoryRecord,
      Media,
      ProjectReportMedia,
    ]),
    ProjectModule,
    PersonModule,
  ],
  providers: [ProjectReportService],
  controllers: [ProjectReportController],
  exports: [TypeOrmModule],
})
export class ProjectReportModule {}
