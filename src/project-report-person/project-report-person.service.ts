import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectReportPerson } from './project-report-person.entity';

@Injectable()
export class ProjectReportPersonService {
  constructor(
    @InjectRepository(ProjectReportPerson)
    private projectReportPersonRepository: Repository<ProjectReportPerson>,
  ) {}

  findAll(): Promise<ProjectReportPerson[]> {
    return this.projectReportPersonRepository.find({ relations: ['projectReport', 'person'] });
  }

  findOne(id: number): Promise<ProjectReportPerson | null> {
    return this.projectReportPersonRepository.findOne({ where: { id }, relations: ['projectReport', 'person'] });
  }

  async create(projectReportPerson: ProjectReportPerson): Promise<ProjectReportPerson> {
    return this.projectReportPersonRepository.save(projectReportPerson);
  }

  async update(id: number, projectReportPerson: ProjectReportPerson): Promise<ProjectReportPerson | null> {
    await this.projectReportPersonRepository.update(id, projectReportPerson);
    return this.projectReportPersonRepository.findOne({ where: { id }, relations: ['projectReport', 'person'] });
  }

  async remove(id: number): Promise<void> {
    await this.projectReportPersonRepository.delete(id);
  }
} 