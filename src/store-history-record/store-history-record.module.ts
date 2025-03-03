import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreHistoryRecord } from './store-history-record.entity';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';
import { Material } from '../material/material.entity';
import { StoreMaterial } from '../store-material/store-material.entity';
import { StoreHistoryRecordService } from './store-history-record.service';
import { StoreHistoryRecordController } from './store-history-record.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreHistoryRecord, Store, Person, Material, StoreMaterial]),
  ],
  providers: [StoreHistoryRecordService],
  controllers: [StoreHistoryRecordController],
  exports: [StoreHistoryRecordService],
})
export class StoreHistoryRecordModule {}
