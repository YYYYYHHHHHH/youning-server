import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StoreMaterial } from './store-material.entity';
import { Store } from '../store/store.entity';
import { Material } from '../material/material.entity';
import { CreateStoreMaterialDto, UpdateStoreMaterialDto } from './store-material.dto';
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

  async findByStoreId(storeId: number): Promise<StoreMaterial[]> {
    const storeMaterials = await this.storeMaterialRepository.find({
      where: { store: { id: storeId } },
      // relations: ['store', 'material'],
      relations: ['material'],
    });

    if (!storeMaterials || storeMaterials.length === 0) {
      throw new BusinessException(
        `No materials found in store with ID ${storeId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return storeMaterials;
  }

  async findByProjectId(projectId: number): Promise<StoreMaterial[]> {
    // 先通过项目ID查找关联的仓库
    const stores = await this.storeRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });

    if (!stores || stores.length === 0) {
      throw new BusinessException(
        `No stores found for Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 获取所有仓库ID，防止出现一个项目多个仓库的情况
    const storeIds = stores.map(store => store.id);

    // 查询这些仓库的所有材料库存信息
    const storeMaterials = await this.storeMaterialRepository.find({
      where: { store: { id: In(storeIds) } },
      relations: ['material'],
    });

    if (!storeMaterials || storeMaterials.length === 0) {
      throw new BusinessException(
        `No materials found in stores for Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return storeMaterials;
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
    storeMaterial.warningThreshold = createDto.warningThreshold !== undefined ? createDto.warningThreshold : null;

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
    storeMaterial.warningThreshold = updateDto.warningThreshold !== undefined ? updateDto.warningThreshold : null;

    await this.storeMaterialRepository.save(storeMaterial);
    return this.findOne(id) as any;
  }

  async updateByStoreAndMaterial(
    storeId: number,
    materialId: number,
    updateDto: UpdateStoreMaterialDto,
  ): Promise<StoreMaterial> {
    // 查找指定仓库中的特定材料记录
    const existingStoreMaterial = await this.storeMaterialRepository.findOne({
      where: {
        store: { id: storeId },
        material: { id: materialId },
      },
      relations: ['store', 'material'],
    });

    if (!existingStoreMaterial) {
      throw new BusinessException(
        `Material with ID ${materialId} not found in store ${storeId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 更新库存信息
    Object.assign(existingStoreMaterial, updateDto);
    return this.storeMaterialRepository.save(existingStoreMaterial);
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
