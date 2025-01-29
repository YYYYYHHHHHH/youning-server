import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreMaterial } from './store-material.entity';

@Injectable()
export class StoreMaterialService {
  constructor(
    @InjectRepository(StoreMaterial)
    private storeMaterialRepository: Repository<StoreMaterial>,
  ) {}

  findAll(): Promise<StoreMaterial[]> {
    return this.storeMaterialRepository.find({ relations: ['store', 'material'] });
  }

  findOne(id: number): Promise<StoreMaterial | null> {
    return this.storeMaterialRepository.findOne({ where: { id }, relations: ['store', 'material'] });
  }

  async create(storeMaterial: StoreMaterial): Promise<StoreMaterial> {
    return this.storeMaterialRepository.save(storeMaterial);
  }

  async update(id: number, storeMaterial: StoreMaterial): Promise<StoreMaterial | null> {
    await this.storeMaterialRepository.update(id, storeMaterial);
    return this.storeMaterialRepository.findOne({ where: { id }, relations: ['store', 'material'] });
  }

  async remove(id: number): Promise<void> {
    await this.storeMaterialRepository.delete(id);
  }
} 