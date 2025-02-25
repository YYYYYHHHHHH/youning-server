import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProjectReport } from './project-report.entity';
import { Project } from '../project/project.entity';
import { Person } from '../person/person.entity';
import { CreateProjectReportDto } from './project-report.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { startOfDay, endOfDay } from 'date-fns';
import { Between } from 'typeorm';
import { ProjectReportPerson } from '../project-report-person/project-report-person.entity';
import { Store } from '../store/store.entity';
import { StoreMaterial } from '../store-material/store-material.entity';
import { StoreHistoryRecord } from '../store-history-record/store-history-record.entity';
import { ChangeType } from '../store-history-record/store-history-record.enum';
import { Material } from '../material/material.entity';

@Injectable()
export class ProjectReportService {
  constructor(
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(ProjectReportPerson)
    private projectReportPersonRepository: Repository<ProjectReportPerson>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreMaterial)
    private storeMaterialRepository: Repository<StoreMaterial>,
    @InjectRepository(StoreHistoryRecord)
    private storeHistoryRecordRepository: Repository<StoreHistoryRecord>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<ProjectReport[]> {
    // 1. 获取所有项目报告
    const reports = await this.projectReportRepository.find({
      relations: [
        'project',
        'createBy',
        'projectReportMedias',
        'projectReportMedias.media',
        'projectReportPersons',
        'projectReportPersons.person',
      ],
      order: {
        createTime: 'DESC',
      },
    });

    // 2. 为每个报告查找对应的历史记录
    const reportsWithHistory = await Promise.all(
      reports.map(async (report) => {
        const dayStart = startOfDay(report.createTime);
        const dayEnd = endOfDay(report.createTime);

        const historyRecords = await this.storeHistoryRecordRepository.find({
          where: {
            time: Between(dayStart, dayEnd),
            store: { project: { id: report.project.id } },
            person: { id: report.createBy.id },
            changeType: ChangeType.CONSUME_OUT,
          },
          relations: ['store', 'store.project', 'person', 'material'],
          order: {
            time: 'DESC',
          },
        });

        return {
          ...report,
          storeHistoryRecords: historyRecords,
        };
      }),
    );

    return reportsWithHistory;
  }

  async findOne(id: number): Promise<ProjectReport | null> {
    const projectReport = await this.projectReportRepository.findOne({
      where: { id },
      relations: [
        'project',
        'createBy',
        'projectReportMedias',
        'projectReportMedias.media',
        'projectReportPersons',
        'projectReportPersons.person',
      ],
    });

    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找相关的历史记录
    const dayStart = startOfDay(projectReport.createTime);
    const dayEnd = endOfDay(projectReport.createTime);

    const historyRecords = await this.storeHistoryRecordRepository.find({
      where: {
        time: Between(dayStart, dayEnd),
        store: { project: { id: projectReport.project.id } },
        person: { id: projectReport.createBy.id },
        changeType: ChangeType.CONSUME_OUT,
      },
      relations: ['store', 'store.project', 'person', 'material'],
      order: {
        time: 'DESC',
      },
    });

    return {
      ...projectReport,
      storeHistoryRecords: historyRecords,
    };
  }

  async create(createDto: CreateProjectReportDto): Promise<ProjectReport> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 创建项目报告
      const projectReport = new ProjectReport();

      const project = await this.projectRepository.findOneBy({
        id: createDto.projectId,
      });
      if (!project) {
        throw new BusinessException(
          `Project with ID ${createDto.projectId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const createBy = await this.personRepository.findOneBy({
        id: createDto.createById,
      });
      if (!createBy) {
        throw new BusinessException(
          `Person with ID ${createDto.createById} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      projectReport.project = project;
      projectReport.createBy = createBy;
      projectReport.createTime = new Date();
      projectReport.remark = createDto.remark;

      const savedProjectReport = await queryRunner.manager.save(projectReport);

      // 2. 创建人员工时记录
      for (const personItem of createDto.persons) {
        const person = await this.personRepository.findOneBy({
          id: personItem.personId,
        });
        if (!person) {
          throw new BusinessException(
            `Person with ID ${personItem.personId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }

        const reportPerson = new ProjectReportPerson();
        reportPerson.projectReport = savedProjectReport;
        reportPerson.person = person;
        reportPerson.workDays = personItem.workDays;
        reportPerson.extraHours = personItem.extraHours;
        reportPerson.gateDate = new Date();

        await queryRunner.manager.save(reportPerson);
      }

      // 3. 创建材料消耗记录
      let store = await this.storeRepository.findOne({
        where: { project: { id: project.id } },
      });

      // 如果项目没有关联仓库，就创建一个
      if (!store) {
        store = this.storeRepository.create({
          name: `${project.name}仓库`,
          project: project,
        });
        await queryRunner.manager.save(store);
      }

      for (const materialItem of createDto.materials) {
        // 检查并更新库存
        let storeMaterial = await this.storeMaterialRepository.findOne({
          where: {
            store: { id: store.id },
            material: { id: materialItem.materialId },
          },
          relations: ['material'],
        });

        // 如果没有库存记录，创建一个新的，初始库存设为 100
        if (!storeMaterial) {
          const material = await queryRunner.manager.findOne(Material, {
            where: { id: materialItem.materialId },
          });

          if (!material) {
            throw new BusinessException(
              `Material with ID ${materialItem.materialId} not found`,
              HttpStatus.NOT_FOUND,
            );
          }

          storeMaterial = this.storeMaterialRepository.create({
            store: store,
            material: material,
            currentStock: 100, // 设置初始库存为 100
            warningThreshold: 20, // 设置预警阈值为 20
          });

          await queryRunner.manager.save(storeMaterial);
        }

        // 检查库存是否充足
        if (storeMaterial.currentStock < materialItem.count) {
          throw new BusinessException(
            `Insufficient stock for material ${materialItem.materialId}. Current stock: ${storeMaterial.currentStock}, Required: ${materialItem.count}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // 更新库存
        storeMaterial.currentStock -= materialItem.count;
        await queryRunner.manager.save(storeMaterial);

        // 创建消耗记录
        const historyRecord = new StoreHistoryRecord();
        historyRecord.time = new Date();
        historyRecord.store = store;
        historyRecord.person = createBy;
        historyRecord.changeType = ChangeType.CONSUME_OUT;
        historyRecord.material = storeMaterial.material;
        historyRecord.count = materialItem.count;

        await queryRunner.manager.save(historyRecord);
      }

      await queryRunner.commitTransaction();

      // 返回完整的关联数据
      const result = await this.projectReportRepository.findOne({
        where: { id: savedProjectReport.id },
        relations: [
          'project',
          'createBy',
          'projectReportMedias',
          'projectReportMedias.media',
          'projectReportPersons',
          'projectReportPersons.person',
        ],
      });

      if (!result) {
        throw new BusinessException(
          `ProjectReport with ID ${savedProjectReport.id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    updateProjectReportDto: CreateProjectReportDto,
  ): Promise<ProjectReport> {
    const projectReport = await this.projectReportRepository.findOne({
      where: { id },
      relations: [
        'createBy',
        'project',
        'projectReportMedias',
        'projectReportMedias.media',
        'projectReportPersons',
        'projectReportPersons.person',
      ],
    });

    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置项目
    const project = await this.projectRepository.findOneBy({
      id: updateProjectReportDto.projectId,
    });
    if (!project) {
      throw new BusinessException(
        `Project with ID ${updateProjectReportDto.projectId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置创建人
    const createBy = await this.personRepository.findOneBy({
      id: updateProjectReportDto.createById,
    });
    if (!createBy) {
      throw new BusinessException(
        `Person with ID ${updateProjectReportDto.createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    projectReport.project = project;
    projectReport.createBy = createBy;
    projectReport.remark = updateProjectReportDto.remark;

    await this.projectReportRepository.save(projectReport);
    const result = await this.projectReportRepository.findOne({
      where: { id },
      relations: [
        'createBy',
        'project',
        'projectReportMedias',
        'projectReportMedias.media',
        'projectReportPersons',
        'projectReportPersons.person',
      ],
    });
    if (!result) {
      throw new BusinessException(
        `ProjectReport with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    const projectReport = await this.projectReportRepository.findOneBy({ id });
    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.projectReportRepository.delete(id);
  }

  async findByDateAndProjectAndCreator(
    date: Date,
    projectId: number,
    createById: number,
  ): Promise<ProjectReport | null> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // 1. 查找项目报告
    const projectReport = await this.projectReportRepository.findOne({
      where: {
        project: { id: projectId },
        createBy: { id: createById },
        createTime: Between(dayStart, dayEnd),
      },
      relations: [
        'project',
        'createBy',
        'projectReportMedias',
        'projectReportMedias.media',
        'projectReportPersons',
        'projectReportPersons.person',
      ],
    });

    if (!projectReport) {
      return null;
    }

    // 2. 查找相关的历史记录
    const historyRecords = await this.storeHistoryRecordRepository.find({
      where: {
        time: Between(dayStart, dayEnd),
        store: { project: { id: projectId } },
        person: { id: createById },
        changeType: ChangeType.CONSUME_OUT,
      },
      relations: ['store', 'store.project', 'person', 'material'],
      order: {
        time: 'DESC',
      },
    });

    // 3. 将历史记录添加到返回结果中
    return {
      ...projectReport,
      storeHistoryRecords: historyRecords,
    };
  }

  async findByProject(projectId: number): Promise<ProjectReport[]> {
    // 1. 获取指定项目的所有日报
    const reports = await this.projectReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.project', 'project')
      .leftJoinAndSelect('report.createBy', 'createBy')
      .leftJoinAndSelect('report.projectReportMedias', 'projectReportMedias')
      .leftJoinAndSelect('projectReportMedias.media', 'media')
      .leftJoinAndSelect('media.createBy', 'mediaCreateBy')
      .leftJoinAndSelect('report.projectReportPersons', 'projectReportPersons')
      .leftJoinAndSelect('projectReportPersons.person', 'person')
      .where('report.project.id = :projectId', { projectId })
      .orderBy('report.createTime', 'DESC')
      .getMany();

    // 2. 为每个报告查找对应的历史记录
    const reportsWithHistory = await Promise.all(
      reports.map(async (report) => {
        const dayStart = startOfDay(report.createTime);
        const dayEnd = endOfDay(report.createTime);

        const historyRecords = await this.storeHistoryRecordRepository.find({
          where: {
            time: Between(dayStart, dayEnd),
            store: { project: { id: projectId } },
            person: { id: report.createBy.id },
            changeType: ChangeType.CONSUME_OUT,
          },
          relations: ['store', 'store.project', 'person', 'material'],
          order: {
            time: 'DESC',
          },
        });

        return {
          ...report,
          storeHistoryRecords: historyRecords,
        };
      }),
    );

    return reportsWithHistory;
  }
}
