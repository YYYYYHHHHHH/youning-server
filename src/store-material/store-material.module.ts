import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreMaterial } from './store-material.entity';
import { StoreMaterialService } from './store-material.service';
import { StoreMaterialController } from './store-material.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreMaterial])],
  providers: [StoreMaterialService],
  controllers: [StoreMaterialController],
})
export class StoreMaterialModule {} 