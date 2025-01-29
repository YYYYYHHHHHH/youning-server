import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  findOne(id: number): Promise<Material | null> {
    return this.materialRepository.findOneBy({ id });
  }

  async create(material: Material): Promise<Material> {
    return this.materialRepository.save(material);
  }

  async update(id: number, material: Material): Promise<Material | null> {
    await this.materialRepository.update(id, material);
    return this.materialRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.materialRepository.delete(id);
  }
}