import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { ProjectReport } from '../project-report/project-report.entity';
import { SalesProject } from '../sales-project/sales-project.entity';
import { FollowUp } from '../follow-up/follow-up.entity';
import { Progress } from '../follow-up/follow-up.enum';

@Injectable()
export class ProjectService {
  /**
   * 构造函数，注入所需的存储库
   * @param projectRepository 项目存储库
   * @param mediaRepository 媒体存储库
   * @param personRepository 人员存储库
   * @param projectReportRepository 项目日报存储库
   * @param salesProjectRepository 销售项目存储库
   * @param followUpRepository 跟进记录存储库
   */
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
    @InjectRepository(SalesProject)
    private salesProjectRepository: Repository<SalesProject>,
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
  ) {}

  /**
   * 查询所有项目列表
   * @returns {Promise<Project[]>} 返回所有项目信息，包含关联的媒体、负责人、创建人和销售项目信息
   */
  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['media', 'manager', 'createBy', 'salesProject'],
    });
  }

  /**
   * 根据ID查询单个项目详细信息
   * @param {number} id - 项目ID
   * @returns {Promise<Project | null>} 返回项目详细信息，如果不存在则返回null
   */
  async findOne(id: number): Promise<Project | null> {
    // 查询项目基本信息
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy', 'salesProject'],
    });

    if (!project) {
      return null;
    }

    return project;
  }

  /**
   * 创建新项目
   * @param {CreateProjectDto} createProjectDto - 创建项目的数据传输对象，包含项目名称、地点、开始时间、结束时间等信息
   * @returns {Promise<Project>} 返回创建成功的项目信息，包含关联的媒体、负责人、创建人信息
   * @throws {BusinessException} 当关联实体（媒体、负责人、创建人、销售项目）不存在时抛出异常
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // 创建数据库事务，确保所有操作要么全部成功，要么全部失败
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

      // 检查销售项目ID是否存在
      let salesProject = undefined;
      if (createProjectDto.salesProjectId) {
        salesProject = await this.salesProjectRepository.findOneBy({
          id: createProjectDto.salesProjectId,
        });
        if (!salesProject) {
          throw new BusinessException(
            `销售项目ID ${createProjectDto.salesProjectId} 不存在`,
            HttpStatus.NOT_FOUND,
          );
        }
      }

      // 2. 创建项目
      const project = this.projectRepository.create({
        ...createProjectDto,
        createTime: new Date(),
        media,
        manager,
        createBy,
        salesProject,
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

  /**
   * 更新项目信息
   * @param {number} id - 要更新的项目ID
   * @param {CreateProjectDto} updateProjectDto - 更新项目的数据传输对象，包含项目名称、地点、开始时间、结束时间等信息
   * @returns {Promise<Project>} 返回更新后的项目信息，包含关联的媒体、负责人、创建人信息
   * @throws {BusinessException} 当项目不存在或关联实体（媒体、负责人、创建人、销售项目）不存在时抛出异常
   */
  async update(
    id: number,
    updateProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy', 'salesProject'],
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

    // 检查销售项目ID是否存在
    let salesProject = undefined;
    if (updateProjectDto.salesProjectId) {
      salesProject = await this.salesProjectRepository.findOneBy({
        id: updateProjectDto.salesProjectId,
      });
      if (!salesProject) {
        throw new BusinessException(
          `销售项目ID ${updateProjectDto.salesProjectId} 不存在`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    // 更新项目基本信息，但保持原有的创建时间
    project.name = updateProjectDto.name;
    project.location = updateProjectDto.location;
    project.startTime = updateProjectDto.startTime;
    project.endTime = updateProjectDto.endTime;
    project.status = updateProjectDto.status || project.status;
    project.clientPhone = updateProjectDto.clientPhone;
    project.salesProjectId = updateProjectDto.salesProjectId;

    // 更新关联实体
    project.media = media;
    project.manager = manager;
    project.createBy = createBy;
    project.salesProject = salesProject;

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

  /**
   * 删除项目
   * @param {number} id - 要删除的项目ID
   * @returns {Promise<void>} 无返回值
   * @throws {BusinessException} 当项目不存在或项目已有关联的日报记录时抛出异常
   */
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

  /**
   * 查询需要创建施工工地的销售项目
   * 查找跟进状态为"成交"但尚未创建施工工地的销售项目
   * @returns {Promise<SalesProject[]>} 返回符合条件的销售项目列表，包含媒体信息和销售人员信息
   * @description 此方法用于查找那些已经成交但尚未创建施工工地的销售项目，以便于后续创建施工工地
   */
  async findPendingConstructionProjects(): Promise<SalesProject[]> {
    // 1. 查找所有已经关联到施工工地的销售项目ID
    const projectsWithSalesProject = await this.projectRepository.find({
      where: { salesProjectId: Not(IsNull()) },
      select: ['salesProjectId'],
    });
    
    // 提取已关联的销售项目ID列表
    const linkedSalesProjectIds = projectsWithSalesProject.map(p => p.salesProjectId);
    
    // 2. 查找所有销售项目中最新跟进状态为"成交"的项目
    // 首先获取每个销售项目的最新跟进记录
    const salesProjects = await this.salesProjectRepository
      .createQueryBuilder('sp')
      .leftJoinAndSelect('sp.followUps', 'fu') // 关联跟进记录
      .leftJoinAndSelect('sp.media', 'media') // 关联媒体信息
      // .leftJoinAndSelect('sp.salesman', 'salesman') // 关联销售人员信息
      .where(qb => {
        // 子查询：获取每个销售项目的最新跟进记录ID
        // 这里使用子查询来解决一个常见问题：如何获取每个分组中的最新记录
        // 对于每个销售项目，我们需要找到其最新的跟进记录（按ID排序，ID越大表示越新）
        const subQuery = qb
          .subQuery()
          .select('MAX(fu2.id)') // 选择每个销售项目的最大（最新）跟进记录ID
          .from(FollowUp, 'fu2') // 从跟进表中查询
          .where('fu2.salesProject = sp.id') // 关联条件：确保跟进记录属于当前销售项目
          .getQuery(); // 生成子查询SQL
        return 'fu.id = ' + subQuery; // 主查询条件：只选择最新的跟进记录
      })
      .andWhere('fu.progress = :progress', { progress: Progress.DEAL }) // 只查询成交状态的项目
      .getMany(); // 执行查询并返回多个结果
    
    // 3. 过滤掉已经关联到施工工地的销售项目
    return salesProjects.filter(sp => !linkedSalesProjectIds.includes(sp.id));
  }
}
