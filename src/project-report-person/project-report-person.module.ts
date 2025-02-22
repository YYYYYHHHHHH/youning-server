import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectReportPerson } from './project-report-person.entity';
import { ProjectReportPersonService } from './project-report-person.service';
import { ProjectReportPersonController } from './project-report-person.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectReportPerson])],
  providers: [ProjectReportPersonService],
  controllers: [ProjectReportPersonController],
})
export class ProjectReportPersonModule {}
