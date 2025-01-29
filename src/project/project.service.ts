import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  findOne(id: number): Promise<Project | null> {
    return this.projectRepository.findOneBy({ id });
  }

  async create(project: Project): Promise<Project> {
    return this.projectRepository.save(project);
  }

  async update(id: number, project: Project): Promise<Project | null> {
    await this.projectRepository.update(id, project);
    return this.projectRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
} 