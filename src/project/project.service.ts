import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { ProjectReport } from '../project-report/project-report.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['media', 'manager', 'createBy'],
    });
  }

  async findOne(id: number): Promise<Project | null> {
    // 1. 查询项目基本信息
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });

    if (!project) {
      return null;
    }

    return project;
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const queryRunner =
      this.projectRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 查找并验证关联实体
      const media = await this.mediaRepository.findOneBy({
        id: createProjectDto.mediaId,
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${createProjectDto.mediaId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const manager = await this.personRepository.findOneBy({
        id: createProjectDto.managerId,
      });
      if (!manager) {
        throw new BusinessException(
          `Manager with ID ${createProjectDto.managerId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const createBy = await this.personRepository.findOneBy({
        id: createProjectDto.createById,
      });
      if (!createBy) {
        throw new BusinessException(
          `Creator with ID ${createProjectDto.createById} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 2. 创建项目
      const project = this.projectRepository.create({
        ...createProjectDto,
        createTime: new Date(),
        media,
        manager,
        createBy,
      });
      const savedProject = await queryRunner.manager.save(Project, project);

      await queryRunner.commitTransaction();

      const result = await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: ['media', 'manager', 'createBy'],
      });
      if (!result) {
        throw new BusinessException(
          `Project with ID ${savedProject.id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateProjectDto: CreateProjectDto,
  ): Promise<Project> {
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

    // 更新项目基本信息，但保持原有的创建时间
    project.name = updateProjectDto.name;
    project.location = updateProjectDto.location;
    project.startTime = updateProjectDto.startTime;
    project.endTime = updateProjectDto.endTime;
    project.status = updateProjectDto.status || project.status;
    project.clientPhone = updateProjectDto.clientPhone;

    // 更新关联实体
    project.media = media;
    project.manager = manager;
    project.createBy = createBy;

    await this.projectRepository.save(project);
    const result = await this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });

    if (!result) {
      throw new BusinessException(
        `Project with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return result;
  }

  async remove(id: number): Promise<void> {
    // 先检查项目是否存在
    const project = await this.projectRepository.findOne({
      where: { id },
    });
    
    if (!project) {
      throw new BusinessException(
        `项目ID ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    // 检查是否有关联的日报记录
    const projectReports = await this.projectReportRepository.find({
      where: { project: { id } },
      take: 1, // 只需要查询是否存在，不需要获取所有记录
    });
    
    if (projectReports.length > 0) {
      throw new BusinessException(
        `无法删除项目，该项目已有日报记录关联`,
        HttpStatus.BAD_REQUEST,
      );
    }
    
    // 如果没有关联的日报记录，则可以删除项目
    await this.projectRepository.delete(id);
  }
}
