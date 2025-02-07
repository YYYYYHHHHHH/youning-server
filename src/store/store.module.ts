import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { Project } from '../project/project.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Project]),
    ProjectModule,
  ],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [TypeOrmModule],
})
export class StoreModule {} 