import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectPhoto } from './project-photo.entity';
import { ProjectPhotoService } from './project-photo.service';
import { ProjectPhotoController } from './project-photo.controller';
import { SalesProject } from '../sales-project/sales-project.entity';
import { Media } from '../media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectPhoto, SalesProject, Media])],
  providers: [ProjectPhotoService],
  controllers: [ProjectPhotoController],
  exports: [ProjectPhotoService],
})
export class ProjectPhotoModule {}