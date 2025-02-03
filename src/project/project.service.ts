import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['media', 'manager', 'createBy'],
    });
  }

  findOne(id: number): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    console.log(createProjectDto);
    const media = await this.mediaRepository.findOneBy({
      id: createProjectDto.mediaId,
    });
    if (!media) {
      throw new Error('Media not found');
    }

    const manager = await this.personRepository.findOneBy({
      id: createProjectDto.managerId,
    });
    if (!manager) {
      throw new Error('Manager not found');
    }

    const createBy = await this.personRepository.findOneBy({
      id: createProjectDto.createById,
    });
    if (!createBy) {
      throw new Error('Creator not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      media,
      manager,
      createBy,
    });
    return this.projectRepository.save(project);
  }

  async update(
    id: number,
    updateProjectDto: CreateProjectDto,
  ): Promise<Project | null> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });

    if (!project) {
      throw new BusinessException(
        `Project with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const media = await this.mediaRepository.findOneBy({
      id: updateProjectDto.mediaId,
    });
    if (!media) {
      throw new BusinessException(
        `Media with ID ${updateProjectDto.mediaId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const manager = await this.personRepository.findOneBy({
      id: updateProjectDto.managerId,
    });
    if (!manager) {
      throw new BusinessException(
        `Manager with ID ${updateProjectDto.managerId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const createBy = await this.personRepository.findOneBy({
      id: updateProjectDto.createById,
    });
    if (!createBy) {
      throw new BusinessException(
        `Creator with ID ${updateProjectDto.createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 更新项目基本信息
    project.name = updateProjectDto.name;
    project.location = updateProjectDto.location;
    project.startTime = updateProjectDto.startTime;
    project.endTime = updateProjectDto.endTime;
    project.remark = updateProjectDto.remark;
    project.createTime = updateProjectDto.createTime;

    // 更新关联实体
    project.media = media;
    project.manager = manager;
    project.createBy = createBy;

    // 保存更新后的实体
    await this.projectRepository.save(project);

    return this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
