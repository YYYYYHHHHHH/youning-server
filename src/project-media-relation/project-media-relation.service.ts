import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMediaRelation } from './project-media-relation.entity';
import { Project } from '../project/project.entity';
import { Media } from '../media/media.entity';
import { CreateProjectMediaRelationDto } from './project-media-relation.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ProjectMediaRelationService {
  constructor(
    @InjectRepository(ProjectMediaRelation)
    private projectMediaRelationRepository: Repository<ProjectMediaRelation>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findByProject(projectId: number): Promise<Media[]> {
    // 查找项目是否存在
    const project = await this.projectRepository.findOneBy({ id: projectId });
    if (!project) {
      throw new BusinessException(
        `Project with ID ${projectId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查询项目关联的所有媒体资源
    const relations = await this.projectMediaRelationRepository.find({
      where: { project: { id: projectId } },
      relations: ['media', 'media.createBy'],
    });

    // 提取媒体资源信息
    return relations.map((relation) => relation.media);
  }

  async create(createDto: CreateProjectMediaRelationDto): Promise<ProjectMediaRelation> {
    // 查找项目是否存在
    const project = await this.projectRepository.findOneBy({
      id: createDto.projectId,
    });
    if (!project) {
      throw new BusinessException(
        `Project with ID ${createDto.projectId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找媒体资源是否存在
    const media = await this.mediaRepository.findOneBy({
      id: createDto.mediaId,
    });
    if (!media) {
      throw new BusinessException(
        `Media with ID ${createDto.mediaId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 检查关联关系是否已存在
    const existingRelation = await this.projectMediaRelationRepository.findOne({
      where: {
        project: { id: createDto.projectId },
        media: { id: createDto.mediaId },
      },
    });

    if (existingRelation) {
      throw new BusinessException(
        `Relation between Project ${createDto.projectId} and Media ${createDto.mediaId} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 创建新的关联关系
    const relation = this.projectMediaRelationRepository.create({
      project,
      media,
    });

    return this.projectMediaRelationRepository.save(relation);
  }

  async remove(projectId: number, mediaId: number): Promise<void> {
    // 查找关联关系
    const relation = await this.projectMediaRelationRepository.findOne({
      where: {
        project: { id: projectId },
        media: { id: mediaId },
      },
    });

    if (!relation) {
      throw new BusinessException(
        `Relation between Project ${projectId} and Media ${mediaId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.projectMediaRelationRepository.remove(relation);
  }
}