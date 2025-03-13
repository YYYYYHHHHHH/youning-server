import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProjectReportPerson } from './project-report-person.entity';
import { ProjectReport } from '../project-report/project-report.entity';
import { Person } from '../person/person.entity';
import { CreateProjectReportPersonDto } from './project-report-person.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ProjectReportPersonService {
  constructor(
    @InjectRepository(ProjectReportPerson)
    private projectReportPersonRepository: Repository<ProjectReportPerson>,
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<ProjectReportPerson[]> {
    return this.projectReportPersonRepository.find({
      relations: ['projectReport', 'projectReport.project','person'],
    });
  }

  async findOne(id: number): Promise<ProjectReportPerson | null> {
    const projectReportPerson =
      await this.projectReportPersonRepository.findOne({
        where: { id },
        relations: ['projectReport', 'person'],
      });
    if (!projectReportPerson) {
      throw new BusinessException(
        `ProjectReportPerson with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return projectReportPerson;
  }

  async create(
    createProjectReportPersonDto: CreateProjectReportPersonDto,
  ): Promise<ProjectReportPerson> {
    const projectReportPerson = new ProjectReportPerson();

    // 查找并设置项目报告
    const projectReport = await this.projectReportRepository.findOneBy({
      id: createProjectReportPersonDto.projectReportId,
    });
    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport with ID ${createProjectReportPersonDto.projectReportId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置人员
    const person = await this.personRepository.findOneBy({
      id: createProjectReportPersonDto.personId,
    });
    if (!person) {
      throw new BusinessException(
        `Person with ID ${createProjectReportPersonDto.personId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    projectReportPerson.projectReport = projectReport;
    projectReportPerson.person = person;
    projectReportPerson.workDays = createProjectReportPersonDto.workDays;
    projectReportPerson.extraHours = createProjectReportPersonDto.extraHours;

    return this.projectReportPersonRepository.save(projectReportPerson);
  }

  async update(
    id: number,
    projectReportPerson: ProjectReportPerson,
  ): Promise<ProjectReportPerson | null> {
    await this.projectReportPersonRepository.update(id, projectReportPerson);
    return this.projectReportPersonRepository.findOne({
      where: { id },
      relations: ['projectReport', 'person'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.projectReportPersonRepository.delete(id);
  }
  // 根据人员ID查询该人员的所有工时记录
  async findByPersonId(personId: number): Promise<ProjectReportPerson[]> {
    // 使用QueryBuilder查询指定人员的所有工时记录
    const reportPersons = await this.projectReportPersonRepository
      .createQueryBuilder('projectReportPerson')
      .leftJoinAndSelect('projectReportPerson.projectReport', 'projectReport')
      .leftJoinAndSelect('projectReport.project', 'project')
      .leftJoinAndSelect('projectReportPerson.person', 'person')
      .leftJoinAndSelect('person.icon', 'icon')
      .where('person.id = :personId', { personId })
      .orderBy('projectReport.createTime', 'DESC')
      .getMany();

    if (!reportPersons || reportPersons.length === 0) {
      throw new BusinessException(
        `No work records found for Person ID ${personId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reportPersons;
  }

  
  /**
   * 获取所有人员的工时汇总信息
   * 
   * @returns 返回包含每个人员工时统计的数组，每个元素包含：
   * - personId: 人员ID
   * - personName: 人员姓名
   * - authority: 人员权限级别
   * - iconUrl: 头像地址
   * - totalWorkDays: 总工作天数
   * - totalExtraHours: 总加班小时数
   */
  async getWorkSummary(): Promise<any[]> {
    // 使用QueryBuilder进行聚合查询，计算每个人员的总工时
    const workSummary = await this.projectReportPersonRepository
      .createQueryBuilder('projectReportPerson')
      .leftJoinAndSelect('projectReportPerson.person', 'person')// 关联人员表
      .leftJoinAndSelect('person.icon', 'icon') // 关联头像表
      .select([
        'person.id as personId', // 选择人员ID
        'person.name as personName',// 选择人员姓名
        'person.authority as authority',// 选择权限级别
        'icon.uri as iconUrl',// 选择头像地址
        'SUM(projectReportPerson.workDays) as totalWorkDays',// 计算总工作天数
        'SUM(projectReportPerson.extraHours) as totalExtraHours'// 计算总加班小时数
      ])
      .groupBy('person.id')// - 主要分组键，按人员ID进行分组，确保每个人员只生成一条汇总记录
      // 这些是补充的分组字段
      .addGroupBy('person.name')
      .addGroupBy('person.authority')
      .addGroupBy('icon.uri')
      .getRawMany();// 获取原始查询结果

    return workSummary;
  }


  /**
   * 根据项目ID查询项目报告人员情况
   * 
   * @param projectId - 项目ID
   * @returns 返回与该项目关联的所有项目报告人员记录
   * 
   * @description
   * 该方法首先查询与指定项目ID关联的所有项目报告，
   * 然后获取这些报告关联的所有人员工时记录。
   * 查询结果包含人员详细信息、工作天数和加班小时数等数据，
   * 并按照项目报告创建时间降序排序，以便查看最新的人员工时情况。
   */
  async findByProjectId(projectId: number): Promise<ProjectReportPerson[]> {
    // 先查询与项目关联的所有项目报告
    const projectReports = await this.projectReportRepository.find({
      where: { project: { id: projectId } },
      order: { createTime: 'DESC' }, // 按创建时间降序排序
    });

    if (!projectReports || projectReports.length === 0) {
      throw new BusinessException(
        `No project reports found for Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 获取所有项目报告ID
    const reportIds = projectReports.map(report => report.id);

    // 查询这些项目报告关联的所有人员工时记录
    // 使用QueryBuilder来精确控制加载的关联关系，避免加载ProjectReport的projectReportMedias 等不需要的数据
    const reportPersons = await this.projectReportPersonRepository
      .createQueryBuilder('projectReportPerson')// 创建查询构建器，设置主表别名
      .leftJoinAndSelect('projectReportPerson.projectReport', 'projectReport')// 关联项目日报表
      .leftJoinAndSelect('projectReportPerson.person', 'person')
      .leftJoinAndSelect('person.icon', 'icon')
      .where('projectReport.id IN (:...reportIds)', { reportIds })// 使用 IN 查询匹配多个日报ID，参数绑定，防止SQL注入
      .orderBy('projectReport.createTime', 'DESC')
      .getMany(); // 执行查询并返回结果数组

    if (!reportPersons || reportPersons.length === 0) {
      throw new BusinessException(
        `No person records found for reports in Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return reportPersons;
  }
}
