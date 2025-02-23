import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreMaterial } from './store-material.entity';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';
import { CreateStoreMaterialDto } from './store-material.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class StoreMaterialService {
  constructor(
    @InjectRepository(StoreMaterial)
    private storeMaterialRepository: Repository<StoreMaterial>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  findAll(): Promise<StoreMaterial[]> {
    return this.storeMaterialRepository.find({
      relations: ['store', 'material'],
    });
  }

  async findOne(id: number): Promise<StoreMaterial | null> {
    const storeMaterial = await this.storeMaterialRepository.findOne({
      where: { id },
      relations: ['store', 'material'],
    });
    if (!storeMaterial) {
      throw new BusinessException(
        `StoreMaterial with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return storeMaterial;
  }

  async create(createDto: CreateStoreMaterialDto): Promise<StoreMaterial> {
    const storeMaterial = new StoreMaterial();

    // 查找并设置仓库
    const store = await this.storeRepository.findOneBy({
      id: createDto.storeId,
    });
    if (!store) {
      throw new BusinessException(
        `Store with ID ${createDto.storeId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置材料
    const material = await this.materialRepository.findOneBy({
      id: createDto.materialId,
    });
    if (!material) {
      throw new BusinessException(
        `Material with ID ${createDto.materialId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    storeMaterial.store = store;
    storeMaterial.material = material;
    storeMaterial.currentStock = createDto.currentStock;
    storeMaterial.warningThreshold = createDto.warningThreshold;

    return this.storeMaterialRepository.save(storeMaterial);
  }

  async update(
    id: number,
    updateDto: CreateStoreMaterialDto,
  ): Promise<StoreMaterial> {
    const storeMaterial = await this.storeMaterialRepository.findOne({
      where: { id },
      relations: ['store', 'material'],
    });

    if (!storeMaterial) {
      throw new BusinessException(
        `StoreMaterial with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置仓库
    const store = await this.storeRepository.findOneBy({
      id: updateDto.storeId,
    });
    if (!store) {
      throw new BusinessException(
        `Store with ID ${updateDto.storeId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置材料
    const material = await this.materialRepository.findOneBy({
      id: updateDto.materialId,
    });
    if (!material) {
      throw new BusinessException(
        `Material with ID ${updateDto.materialId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    storeMaterial.store = store;
    storeMaterial.material = material;
    storeMaterial.currentStock = updateDto.currentStock;
    storeMaterial.warningThreshold = updateDto.warningThreshold;

    await this.storeMaterialRepository.save(storeMaterial);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const storeMaterial = await this.storeMaterialRepository.findOneBy({ id });
    if (!storeMaterial) {
      throw new BusinessException(
        `StoreMaterial with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.storeMaterialRepository.delete(id);
  }
}
