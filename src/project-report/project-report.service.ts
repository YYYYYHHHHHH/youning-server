import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectReport } from './project-report.entity';
import { Project } from '../project/project.entity';
import { Person } from '../person/person.entity';
import { CreateProjectReportDto } from './project-report.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { startOfDay, endOfDay } from 'date-fns';
import { Between } from 'typeorm';

@Injectable()
export class ProjectReportService {
  constructor(
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
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

  async create(
    createProjectReportDto: CreateProjectReportDto,
  ): Promise<ProjectReport> {
    const projectReport = new ProjectReport();

    // 查找并设置项目
    const project = await this.projectRepository.findOneBy({
      id: createProjectReportDto.projectId,
    });
    if (!project) {
      throw new BusinessException(
        `Project with ID ${createProjectReportDto.projectId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置创建人
    const createBy = await this.personRepository.findOneBy({
      id: createProjectReportDto.createById,
    });
    if (!createBy) {
      throw new BusinessException(
        `Person with ID ${createProjectReportDto.createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    projectReport.project = project;
    projectReport.createBy = createBy;
    projectReport.remark = createProjectReportDto.remark;
    projectReport.createTime = createProjectReportDto.createTime;

    return this.projectReportRepository.save(projectReport);
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
    projectReport.createTime = updateProjectReportDto.createTime;

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
      relations: ['createBy', 'project'],
    });
  }
}
