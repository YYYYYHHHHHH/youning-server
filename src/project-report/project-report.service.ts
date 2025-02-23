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

  findAll(): Promise<ProjectReport[]> {
    return this.projectReportRepository.find({
      relations: ['createBy', 'project'],
    });
  }

  async findOne(id: number): Promise<ProjectReport | null> {
    const projectReport = await this.projectReportRepository.findOne({
      where: { id },
      relations: ['createBy', 'project'],
    });
    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return projectReport;
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
      const store = await this.storeRepository.findOne({
        where: { project: { id: project.id } },
      });
      if (!store) {
        throw new BusinessException(
          `No store found for project ${project.id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      for (const materialItem of createDto.materials) {
        // 检查并更新库存
        const storeMaterial = await this.storeMaterialRepository.findOne({
          where: {
            store: { id: store.id },
            material: { id: materialItem.materialId },
          },
        });

        if (!storeMaterial || storeMaterial.currentStock < materialItem.count) {
          throw new BusinessException(
            `Insufficient stock for material ${materialItem.materialId}`,
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
      return savedProjectReport;
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
      relations: ['createBy', 'project'],
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
      relations: ['createBy', 'project'],
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
    // 获取指定日期的开始和结束时间
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return this.projectReportRepository.findOne({
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
      ],
    });
  }
}
