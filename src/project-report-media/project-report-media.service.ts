import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectReportMedia } from './project-report-media.entity';

@Injectable()
export class ProjectReportMediaService {
  constructor(
    @InjectRepository(ProjectReportMedia)
    private projectReportMediaRepository: Repository<ProjectReportMedia>,
  ) {}

  findAll(): Promise<ProjectReportMedia[]> {
    return this.projectReportMediaRepository.find({ relations: ['projectReport', 'media'] });
  }

  findOne(id: number): Promise<ProjectReportMedia | null> {
    return this.projectReportMediaRepository.findOne({ where: { id }, relations: ['projectReport', 'media'] });
  }

  async create(projectReportMedia: ProjectReportMedia): Promise<ProjectReportMedia> {
    return this.projectReportMediaRepository.save(projectReportMedia);
  }

  async update(id: number, projectReportMedia: ProjectReportMedia): Promise<ProjectReportMedia | null> {
    await this.projectReportMediaRepository.update(id, projectReportMedia);
    return this.projectReportMediaRepository.findOne({ where: { id }, relations: ['projectReport', 'media'] });
  }

  async remove(id: number): Promise<void> {
    await this.projectReportMediaRepository.delete(id);
  }
} 