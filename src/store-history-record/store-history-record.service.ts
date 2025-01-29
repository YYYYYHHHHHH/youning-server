import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreHistoryRecord } from './store-history-record.entity';

@Injectable()
export class StoreHistoryRecordService {
  constructor(
    @InjectRepository(StoreHistoryRecord)
    private storeHistoryRecordRepository: Repository<StoreHistoryRecord>,
  ) {}

  findAll(): Promise<StoreHistoryRecord[]> {
    return this.storeHistoryRecordRepository.find({ relations: ['store', 'person'] });
  }

  findOne(id: number): Promise<StoreHistoryRecord | null> {
    return this.storeHistoryRecordRepository.findOne({ where: { id }, relations: ['store', 'person'] });
  }

  async create(storeHistoryRecord: StoreHistoryRecord): Promise<StoreHistoryRecord> {
    return this.storeHistoryRecordRepository.save(storeHistoryRecord);
  }

  async update(id: number, storeHistoryRecord: StoreHistoryRecord): Promise<StoreHistoryRecord | null> {
    await this.storeHistoryRecordRepository.update(id, storeHistoryRecord);
    return this.storeHistoryRecordRepository.findOne({ where: { id }, relations: ['store', 'person'] });
  }

  async remove(id: number): Promise<void> {
    await this.storeHistoryRecordRepository.delete(id);
  }
} 