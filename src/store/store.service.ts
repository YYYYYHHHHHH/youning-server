import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';
import { CreateStoreDto } from './store.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['project', 'project.createBy', 'project.manager'],
    });
  }

  async findOne(id: number): Promise<Store | null> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['project', 'project.createBy', 'project.manager'],
    });
    if (!store) {
      throw new BusinessException(
        `Store with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return store;
  }

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const store = new Store();
    store.name = createStoreDto.name;

    if (createStoreDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: createStoreDto.projectId },
        relations: ['createBy', 'manager'],
      });
      if (!project) {
        throw new BusinessException(
          `Project with ID ${createStoreDto.projectId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      store.project = project;
    }

    if (createStoreDto.mediaId) {
      const media = await this.mediaRepository.findOneBy({
        id: createStoreDto.mediaId,
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${createStoreDto.mediaId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      store.media = media;
    }

    return this.storeRepository.save(store);
  }

  async update(id: number, updateStoreDto: CreateStoreDto): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['project', 'project.createBy', 'project.manager'],
    });

    if (!store) {
      throw new BusinessException(
        `Store with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    store.name = updateStoreDto.name;

    if (updateStoreDto.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: updateStoreDto.projectId },
        relations: ['createBy', 'manager'],
      });
      if (!project) {
        throw new BusinessException(
          `Project with ID ${updateStoreDto.projectId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      store.project = project;
    }

    if (updateStoreDto.mediaId) {
      const media = await this.mediaRepository.findOneBy({
        id: updateStoreDto.mediaId,
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${updateStoreDto.mediaId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      store.media = media;
    }

    await this.storeRepository.save(store);
    const result = await this.storeRepository.findOne({
      where: { id },
      relations: ['project', 'project.createBy', 'project.manager'],
    });
    if (!result) {
      throw new BusinessException(
        `Store with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    const store = await this.storeRepository.findOneBy({ id });
    if (!store) {
      throw new BusinessException(
        `Store with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.storeRepository.delete(id);
  }
}
