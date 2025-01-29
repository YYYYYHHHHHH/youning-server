import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreHistoryRecord } from './store-history-record.entity';
import { StoreHistoryRecordService } from './store-history-record.service';
import { StoreHistoryRecordController } from './store-history-record.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StoreHistoryRecord])],
  providers: [StoreHistoryRecordService],
  controllers: [StoreHistoryRecordController],
})
export class StoreHistoryRecordModule {} 