import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  findAll(): Promise<Store[]> {
    return this.storeRepository.find({ relations: ['project'] });
  }

  findOne(id: number): Promise<Store | null> {
    return this.storeRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async create(store: Store): Promise<Store> {
    return this.storeRepository.save(store);
  }

  async update(id: number, store: Store): Promise<Store | null> {
    await this.storeRepository.update(id, store);
    return this.storeRepository.findOne({ where: { id }, relations: ['project'] });
  }

  async remove(id: number): Promise<void> {
    await this.storeRepository.delete(id);
  }
} 