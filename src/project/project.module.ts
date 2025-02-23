import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MediaModule } from '../media/media.module';
import { PersonModule } from '../person/person.module';
import { StoreModule } from '../store/store.module';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';
import { StoreMaterial } from '../store-material/store-material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectReportPerson,
      StoreHistoryRecord,
      StoreMaterial,
    ]),
    MediaModule,
    PersonModule,
    forwardRef(() => StoreModule),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
