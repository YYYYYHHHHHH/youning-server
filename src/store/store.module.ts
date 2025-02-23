import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { Project } from '../project/project.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, Project]),
    forwardRef(() => ProjectModule),
  ],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [TypeOrmModule, StoreService],
})
export class StoreModule {}
