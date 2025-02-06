import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { CreateMaterialDto } from './material.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Material[]> {
    return this.materialRepository.find({
      relations: ['icon', 'createBy'],
    });
  }

  findOne(id: number): Promise<Material | null> {
    return this.materialRepository.findOne({
      where: { id },
      relations: ['icon', 'createBy'],
    });
  }

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    const material = new Material();

    // 查找并设置图标
    const icon = await this.mediaRepository.findOneBy({
      id: createMaterialDto.iconId,
    });
    if (!icon) {
      throw new BusinessException(
        `Media with ID ${createMaterialDto.iconId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置创建者
    const createBy = await this.personRepository.findOneBy({
      id: createMaterialDto.createById,
    });
    if (!createBy) {
      throw new BusinessException(
        `Person with ID ${createMaterialDto.createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 设置基本属性
    material.name = createMaterialDto.name;
    material.unit = createMaterialDto.unit;
    material.createTime = createMaterialDto.createTime;
    material.icon = icon;
    material.createBy = createBy;

    return this.materialRepository.save(material);
  }

  async update(
    id: number,
    updateMaterialDto: CreateMaterialDto,
  ): Promise<Material | null> {
    const material = await this.materialRepository.findOne({
      where: { id },
      relations: ['icon', 'createBy'],
    });

    if (!material) {
      throw new BusinessException(
        `Material with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置图标
    const icon = await this.mediaRepository.findOneBy({
      id: updateMaterialDto.iconId,
    });
    if (!icon) {
      throw new BusinessException(
        `Media with ID ${updateMaterialDto.iconId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置创建者
    const createBy = await this.personRepository.findOneBy({
      id: updateMaterialDto.createById,
    });
    if (!createBy) {
      throw new BusinessException(
        `Person with ID ${updateMaterialDto.createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 更新基本属性
    material.name = updateMaterialDto.name;
    material.unit = updateMaterialDto.unit;
    material.createTime = updateMaterialDto.createTime;
    material.icon = icon;
    material.createBy = createBy;

    // 保存更新后的实体
    await this.materialRepository.save(material);

    return this.materialRepository.findOne({
      where: { id },
      relations: ['icon', 'createBy'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.materialRepository.delete(id);
  }
}
