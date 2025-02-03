import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { Media } from '../media/media.entity';
import { Person } from '../person/person.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['media', 'manager', 'createBy'],
    });
  }

  findOne(id: number): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const media = await this.mediaRepository.findOneBy({
      id: createProjectDto.mediaId,
    });
    if (!media) {
      throw new Error('Media not found');
    }

    const manager = await this.personRepository.findOneBy({
      id: createProjectDto.managerId,
    });
    if (!manager) {
      throw new Error('Manager not found');
    }

    const createBy = await this.personRepository.findOneBy({
      id: createProjectDto.createById,
    });
    if (!createBy) {
      throw new Error('Creator not found');
    }

    const project = this.projectRepository.create({
      ...createProjectDto,
      media,
      manager,
      createBy,
    });
    return this.projectRepository.save(project);
  }

  async update(
    id: number,
    updateProjectDto: CreateProjectDto,
  ): Promise<Project | null> {
    const media = await this.mediaRepository.findOneBy({
      id: updateProjectDto.mediaId,
    });
    if (!media) {
      throw new Error('Media not found');
    }

    const manager = await this.personRepository.findOneBy({
      id: updateProjectDto.managerId,
    });
    if (!manager) {
      throw new Error('Manager not found');
    }

    const createBy = await this.personRepository.findOneBy({
      id: updateProjectDto.createById,
    });
    if (!createBy) {
      throw new Error('Creator not found');
    }

    await this.projectRepository.update(id, {
      ...updateProjectDto,
      media,
      manager,
      createBy,
    });
    return this.projectRepository.findOne({
      where: { id },
      relations: ['media', 'manager', 'createBy'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.projectRepository.delete(id);
  }
}
