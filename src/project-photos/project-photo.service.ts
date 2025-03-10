import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectPhoto } from './project-photo.entity';
import { CreateProjectPhotoDto, UpdateProjectPhotoDto } from './project-photo.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ProjectPhotoService {
  constructor(
    @InjectRepository(ProjectPhoto)
    private projectPhotoRepository: Repository<ProjectPhoto>,
  ) {}

  async create(createProjectPhotoDto: CreateProjectPhotoDto): Promise<ProjectPhoto> {
    const { salesProjectId, mediaId } = createProjectPhotoDto;
    const projectPhoto = new ProjectPhoto();
    projectPhoto.salesProject = { id: salesProjectId } as any;
    projectPhoto.media = { id: mediaId } as any;
    return this.projectPhotoRepository.save(projectPhoto);
  }

  async findAll(): Promise<ProjectPhoto[]> {
    return this.projectPhotoRepository.find({
      relations: ['salesProject', 'media'],
    });
  }

  async findBySalesProjectId(salesProjectId: number): Promise<ProjectPhoto[]> {
    return this.projectPhotoRepository.find({
      where: { salesProject: { id: salesProjectId } },
      relations: ['media'],
    });
  }

  async findOne(id: number): Promise<ProjectPhoto> {
    const projectPhoto = await this.projectPhotoRepository.findOne({
      where: { id },
      relations: ['salesProject', 'media'],
    });
    
    if (!projectPhoto) {
      throw new BusinessException(
        `ProjectPhoto with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    return projectPhoto;
  }

  async update(id: number, updateProjectPhotoDto: UpdateProjectPhotoDto): Promise<ProjectPhoto> {
    const projectPhoto = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查

    if (updateProjectPhotoDto.salesProjectId) {
      projectPhoto.salesProject = { id: updateProjectPhotoDto.salesProjectId } as any;
    }

    if (updateProjectPhotoDto.mediaId) {
      projectPhoto.media = { id: updateProjectPhotoDto.mediaId } as any;
    }

    return this.projectPhotoRepository.save(projectPhoto);
  }

  async remove(id: number): Promise<void> {
    const projectPhoto = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查
    
    await this.projectPhotoRepository.remove(projectPhoto);
  }
}