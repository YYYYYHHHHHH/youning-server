import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      relations: ['projectReport', 'person'],
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
}
