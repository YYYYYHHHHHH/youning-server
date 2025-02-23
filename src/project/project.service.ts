import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { Store } from '../store/store.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';
import { ChangeType } from '../store-history-record/store-history-record.enum';
import { StoreMaterial } from '../store-material/store-material.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(ProjectReportPerson)
    private projectReportPersonRepository: Repository<ProjectReportPerson>,
    @InjectRepository(StoreHistoryRecord)
    private storeHistoryRecordRepository: Repository<StoreHistoryRecord>,
    @InjectRepository(StoreMaterial)
    private storeMaterialRepository: Repository<StoreMaterial>,
  ) {}

  async findAll(): Promise<Project[]> {
    // 1. 查询所有项目
    const projects = await this.projectRepository.find({
      relations: ['media', 'manager', 'createBy'],
    });

    // 2. 为每个项目查询关联数据
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        // 查询工人工时
        const projectWorkerTimeRecords =
          await this.projectReportPersonRepository
            .createQueryBuilder('reportPerson')
            .leftJoinAndSelect('reportPerson.person', 'person')
            .leftJoinAndSelect('reportPerson.projectReport', 'report')
            .where('report.project.id = :projectId', { projectId: project.id })
            .getMany();

        // 查询物料消耗记录
        const materialConsumptionRecords =
          await this.storeHistoryRecordRepository
            .createQueryBuilder('history')
            .leftJoinAndSelect('history.material', 'material')
            .leftJoinAndSelect('history.person', 'person')
            .leftJoinAndSelect('history.store', 'store')
            .where('store.project.id = :projectId', { projectId: project.id })
            .andWhere('history.changeType = :changeType', {
              changeType: ChangeType.CONSUME_OUT,
            })
            .orderBy('history.time', 'DESC')
            .getMany();

        // 查询当前仓库的物料库存
        const currentMaterialStock = await this.storeMaterialRepository
          .createQueryBuilder('storeMaterial')
          .leftJoinAndSelect('storeMaterial.material', 'material')
          .leftJoinAndSelect('storeMaterial.store', 'store')
          .where('store.project.id = :projectId', { projectId: project.id })
          .getMany();

        return {
          ...project,
          projectWorkerTimeRecords,
          materialConsumptionRecords,
          currentMaterialStock,
        };
      }),
    );

    return projectsWithDetails;
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

    // 2. 查询项目相关的工人工时
    const projectWorkerTimeRecords = await this.projectReportPersonRepository
      .createQueryBuilder('reportPerson')
      .leftJoinAndSelect('reportPerson.person', 'person')
      .leftJoinAndSelect('reportPerson.projectReport', 'report')
      .where('report.project.id = :projectId', { projectId: id })
      .getMany();

    // 3. 查询项目相关的物料消耗记录
    const materialConsumptionRecords = await this.storeHistoryRecordRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.material', 'material')
      .leftJoinAndSelect('history.person', 'person')
      .leftJoinAndSelect('history.store', 'store')
      .where('store.project.id = :projectId', { projectId: id })
      .andWhere('history.changeType = :changeType', {
        changeType: ChangeType.CONSUME_OUT,
      })
      .orderBy('history.time', 'DESC')
      .getMany();

    // 4. 查询当前仓库的物料库存
    const currentMaterialStock = await this.storeMaterialRepository
      .createQueryBuilder('storeMaterial')
      .leftJoinAndSelect('storeMaterial.material', 'material')
      .leftJoinAndSelect('storeMaterial.store', 'store')
      .where('store.project.id = :projectId', { projectId: id })
      .getMany();

    // 5. 合并结果
    return {
      ...project,
      projectWorkerTimeRecords,
      materialConsumptionRecords,
      currentMaterialStock,
    };
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

      // 3. 创建关联的仓库
      const store = this.storeRepository.create({
        name: `${project.name}仓库`,
        project: savedProject,
      });
      await queryRunner.manager.save(Store, store);

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
    project.remark = updateProjectDto.remark;

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
    await this.projectRepository.delete(id);
  }
}
