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
import { Media } from '../media/media.entity';
import { ProjectReportMedia } from '../project-report-media/project-report-media.entity';

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
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(ProjectReportMedia)
    private projectReportMediaRepository: Repository<ProjectReportMedia>,
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
        const historyRecords = await this.storeHistoryRecordRepository.find({
          where: {
            projectReportId: report.id,
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
    const historyRecords = await this.storeHistoryRecordRepository.find({
      where: {
        projectReportId: projectReport.id,
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

  /**
   * 创建项目日报
   * 
   * @param createDto - 创建项目日报的数据传输对象，包含以下信息：
   * - projectId: 项目ID
   * - createById: 创建人ID
   * - remark: 备注信息
   * - persons: 工人工时记录数组
   * - materials: 材料消耗记录数组
   * - mediaIds: 日报图片ID数组
   * 
   * @returns 返回创建成功的项目日报对象，包含所有关联数据
   * 
   * @description
   * 该方法使用事务来确保数据的一致性，主要包含以下步骤：
   * 1. 创建项目日报基本信息
   *    - 验证并关联项目信息
   *    - 验证并关联创建人信息
   *    - 设置创建时间和备注
   * 
   * 2. 创建人员工时记录
   *    - 遍历工人列表
   *    - 验证每个工人的存在性
   *    - 创建工时记录（包含工作天数和加班小时数）
   * 
   * 3. 创建材料消耗记录
   *    - 获取项目关联的仓库
   *    - 遍历材料列表
   *    - 检查每种材料的库存是否充足
   *    - 更新库存数量
   *    - 创建消耗出库记录
   * 
   * 4. 创建日报图片记录
   *    - 遍历图片ID列表
   *    - 验证每个图片的存在性
   *    - 创建图片关联记录
   * 
   * 如果以上任何步骤失败，整个事务将回滚，确保数据的完整性
   */
  // 创建项目日报，参数包含：项目ID、创建人ID、备注信息、工人工时记录、材料消耗记录、日报图片
  async create(createDto: CreateProjectReportDto): Promise<ProjectReport> {
    // 创建数据库事务，确保所有操作要么全部成功，要么全部失败
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 创建项目日报基本信息
      const projectReport = new ProjectReport();

      // 查找并验证项目是否存在
      const project = await this.projectRepository.findOneBy({
        id: createDto.projectId,
      });
      if (!project) {
        throw new BusinessException(
          `Project with ID ${createDto.projectId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // 查找并验证创建人是否存在
      const createBy = await this.personRepository.findOneBy({
        id: createDto.createById,
      });
      if (!createBy) {
        throw new BusinessException(
          `Person with ID ${createDto.createById} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      //设置日报基本属性：关联项目、创建人、创建时间和备注
      projectReport.project = project;
      projectReport.createBy = createBy;
      projectReport.createTime = new Date();// 使用当前时间作为创建时间
      projectReport.remark = createDto.remark;
      // 保存日报基本信息到数据库
      const savedProjectReport = await queryRunner.manager.save(projectReport);

      // 2. 创建人员工时记录：遍历工人列表，记录每个工人的工作天数和加班小时数
      for (const personItem of createDto.persons) {
        // 验证工人是否存在
        const person = await this.personRepository.findOneBy({
          id: personItem.personId,
        });
        if (!person) {
          throw new BusinessException(
            `Person with ID ${personItem.personId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        // 创建工人工时记录
        const reportPerson = new ProjectReportPerson();
        reportPerson.projectReport = savedProjectReport;// 关联到当前日报
        reportPerson.person = person;// 关联到具体工人
        reportPerson.workDays = personItem.workDays;
        reportPerson.extraHours = personItem.extraHours;
        // 保存工时记录到数据库
        await queryRunner.manager.save(reportPerson);
      }

      // 3. 创建材料消耗记录：获取项目仓库，检查并更新库存，记录消耗情况
      const store = await this.storeRepository.findOne({
        where: { project: { id: project.id } },
      });
      // 验证项目是否有关联仓库
      if (!store) {
        throw new BusinessException(
          `Project ${project.id} does not have an associated store`,
          HttpStatus.NOT_FOUND,
        );
      }
      // 遍历所有消耗的材料
      for (const materialItem of createDto.materials) {
        // 查找仓库中该材料的库存记录
        const storeMaterial = await this.storeMaterialRepository.findOne({
          where: {
            store: { id: store.id },
            material: { id: materialItem.materialId },
          },
          relations: ['material'],// 同时加载材料详细信息
        });
        // 验证库存记录是否存在
        if (!storeMaterial) {
          throw new BusinessException(
            `No stock record found for material ${materialItem.materialId} in store ${store.id}`,
            HttpStatus.NOT_FOUND,
          );
        }

        // 检查库存是否充足
        if (storeMaterial.currentStock < materialItem.count) {
          throw new BusinessException(
            `Insufficient stock for material ${materialItem.materialId}. Current stock: ${storeMaterial.currentStock}, Required: ${materialItem.count}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // 更新库存数量，减去该材料的消耗数量
        storeMaterial.currentStock -= materialItem.count;
        await queryRunner.manager.save(storeMaterial);

        // 创建材料消耗记录
        const historyRecord = new StoreHistoryRecord();
        historyRecord.time = new Date();
        historyRecord.store = store;// 关联仓库
        historyRecord.person = createBy;// 操作人为日报创建人
        historyRecord.changeType = ChangeType.CONSUME_OUT;
        historyRecord.material = storeMaterial.material; // 关联具体材料
        historyRecord.count = materialItem.count;
        historyRecord.projectReportId = savedProjectReport.id;

        // 保存材料消耗记录到数据库
        await queryRunner.manager.save(historyRecord);
      }

      // 4. 创建日报图片记录：关联上传的图片
      if (createDto.mediaIds && createDto.mediaIds.length > 0) {
        for (const mediaId of createDto.mediaIds) {
          const media = await this.mediaRepository.findOneBy({ id: mediaId });
          if (!media) {
            throw new BusinessException(
              `Media with ID ${mediaId} not found`,
              HttpStatus.NOT_FOUND,
            );
          }

          const projectReportMedia = new ProjectReportMedia();
          projectReportMedia.projectReport = savedProjectReport;
          projectReportMedia.media = media;

          await queryRunner.manager.save(projectReportMedia);
        }
      }
      // 所有操作成功，提交事务
      await queryRunner.commitTransaction();

      // 查询并返回完整的项目日报数据（包含所有关联信息）
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
      // 验证查询结果
      if (!result) {
        throw new BusinessException(
          `ProjectReport with ID ${savedProjectReport.id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (err) {
      // 发生错误，回滚所有操作
      await queryRunner.rollbackTransaction();
      throw err;// 向上层抛出异常
    } finally {
      // 无论成功失败，都释放数据库连接
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
        projectReportId: projectReport.id,
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
      // 1. 使用 TypeORM 的 QueryBuilder 来构建复杂的关联查询，可以更灵活地控制关联查询 优化查询性能 处理更复杂的查询条件
      .createQueryBuilder('report') // 创建查询构建器，'report' 是主表别名
      // 关联查询：
      .leftJoinAndSelect('report.createBy', 'createBy')// 关联日报创建人
      .leftJoinAndSelect('report.projectReportMedias', 'projectReportMedias')// 关联日报图片关系表
      .leftJoinAndSelect('projectReportMedias.media', 'media')// 关联具体图片信息
      .leftJoinAndSelect('report.projectReportPersons', 'projectReportPersons')// 关联工人工时记录
      .leftJoinAndSelect('projectReportPersons.person', 'person')// 关联具体工人信息
      // 查询条件：匹配项目ID
      .where('report.project.id = :projectId', { projectId })
      .orderBy('report.createTime', 'DESC')// 按创建时间倒序排序
      .getMany();// 执行查询并返回结果

    // 2. 为每个报告查找对应的历史记录
    const reportsWithHistory = await Promise.all(
      reports.map(async (report) => {

        // 查询与当前日报相关的物料消耗记录
        const historyRecords = await this.storeHistoryRecordRepository.find({
          where: {
            projectReportId: report.id, // 筛选条件1：匹配日报ID
            changeType: ChangeType.CONSUME_OUT, // 筛选条件2：变动类型为消耗出库
          },
          relations: ['material'],// 关联物料信息
          order: {
            time: 'DESC',// 按时间倒序排列，最新的记录在前
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
