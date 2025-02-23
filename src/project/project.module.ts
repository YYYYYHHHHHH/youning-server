import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { MediaModule } from '../media/media.module';
import { PersonModule } from '../person/person.module';
import { StoreModule } from '../store/store.module';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { Store } from '../store/store.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Media, Person, Store]),
    MediaModule,
    PersonModule,
    forwardRef(() => StoreModule),
  ],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
