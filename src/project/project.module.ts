import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MediaModule } from '../media/media.module';
import { PersonModule } from '../person/person.module';
import { ProjectReport } from '../project-report/project-report.entity';
import { SalesProject } from '../sales-project/sales-project.entity';
import { FollowUp } from '../follow-up/follow-up.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectReport, SalesProject, FollowUp]),
    MediaModule,
    PersonModule,
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
