import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMediaRelationController } from './project-media-relation.controller';
import { ProjectMediaRelationService } from './project-media-relation.service';
import { ProjectMediaRelation } from './project-media-relation.entity';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMediaRelation, Project, Media])],
  controllers: [ProjectMediaRelationController],
  providers: [ProjectMediaRelationService],
  exports: [ProjectMediaRelationService],
})
export class ProjectMediaRelationModule {}