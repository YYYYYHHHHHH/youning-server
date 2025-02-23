import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreMaterial } from './store-material.entity';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';
import { StoreMaterialService } from './store-material.service';
import { StoreMaterialController } from './store-material.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreMaterial, Store, Material])],
  providers: [StoreMaterialService],
  controllers: [StoreMaterialController],
  exports: [StoreMaterialService],
})
export class StoreMaterialModule {}
