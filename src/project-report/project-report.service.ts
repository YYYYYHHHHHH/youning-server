import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectReport } from './project-report.entity';

@Injectable()
export class ProjectReportService {
  constructor(
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
  ) {}

  findAll(): Promise<ProjectReport[]> {
    return this.projectReportRepository.find({ relations: ['person', 'project'] });
  }

  findOne(id: number): Promise<ProjectReport | null> {
    return this.projectReportRepository.findOne({ where: { id }, relations: ['person', 'project'] });
  }

  async create(projectReport: ProjectReport): Promise<ProjectReport> {
    return this.projectReportRepository.save(projectReport);
  }

  async update(id: number, projectReport: ProjectReport): Promise<ProjectReport | null> {
    await this.projectReportRepository.update(id, projectReport);
    return this.projectReportRepository.findOne({ where: { id }, relations: ['person', 'project'] });
  }

  async remove(id: number): Promise<void> {
    await this.projectReportRepository.delete(id);
  }
} 