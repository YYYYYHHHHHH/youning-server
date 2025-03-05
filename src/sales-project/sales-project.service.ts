import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesProject } from './sales-project.entity';
import { Person } from '../person/person.entity';
import { Media } from '../media/media.entity';
import { CreateSalesProjectDto, UpdateSalesProjectDto } from './sales-project.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { Authority } from '../person/person.enum';
import { Progress } from '../follow-up/follow-up.enum';

@Injectable()
export class SalesProjectService {
  constructor(
    @InjectRepository(SalesProject)
    private salesProjectRepository: Repository<SalesProject>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(): Promise<SalesProject[]> {
    return this.salesProjectRepository.find({
      relations: ['salesman', 'media', 'contracts', 'followUps', 'projectPhotos'],
      order: {
        createTime: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<SalesProject> {
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id },
      relations: ['salesman', 'media', 'contracts', 'followUps', 'projectPhotos'],
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    return salesProject;
  }

  async create(createDto: CreateSalesProjectDto): Promise<SalesProject> {
    // 验证销售人员
    const salesman = await this.personRepository.findOne({
      where: { id: createDto.salesmanId },
    });

    if (!salesman) {
      throw new BusinessException(
        `销售人员ID ${createDto.salesmanId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证销售人员权限
    if (![Authority.ADMIN, Authority.SALES].includes(salesman.authority)) {
      throw new BusinessException(
        '只有管理员或销售人员可以创建销售项目',
        HttpStatus.FORBIDDEN,
      );
    }

    // 验证媒体资源
    const media = await this.mediaRepository.findOne({
      where: { id: createDto.mediaId },
    });

    if (!media) {
      throw new BusinessException(
        `媒体资源ID ${createDto.mediaId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    const salesProject = this.salesProjectRepository.create({
      ...createDto,
      createTime: new Date(),
      salesman,
      media,
    });

    return this.salesProjectRepository.save(salesProject);
  }

  async update(
    id: number,
    updateDto: UpdateSalesProjectDto,
  ): Promise<SalesProject> {
    const salesProject = await this.findOne(id);

    // 验证销售人员
    const salesman = await this.personRepository.findOne({
      where: { id: updateDto.salesmanId },
    });

    if (!salesman) {
      throw new BusinessException(
        `销售人员ID ${updateDto.salesmanId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证销售人员权限
    if (![Authority.ADMIN, Authority.SALES].includes(salesman.authority)) {
      throw new BusinessException(
        '只有管理员或销售人员可以更新销售项目',
        HttpStatus.FORBIDDEN,
      );
    }

    // 验证媒体资源
    const media = await this.mediaRepository.findOne({
      where: { id: updateDto.mediaId },
    });

    if (!media) {
      throw new BusinessException(
        `媒体资源ID ${updateDto.mediaId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 更新实体
    Object.assign(salesProject, {
      ...updateDto,
      updateTime: new Date(),
      salesman,
      media,
    });

    return this.salesProjectRepository.save(salesProject);
  }

  async remove(id: number): Promise<void> {
    const salesProject = await this.findOne(id);
    await this.salesProjectRepository.remove(salesProject);
  }

  async getLatestProgress(id: number): Promise<Progress | null> {
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id },
      relations: ['followUps'],
    });

    if (!salesProject || !salesProject.followUps || salesProject.followUps.length === 0) {
      return null;
    }

    // 按照跟进时间降序排序，获取最新的进度状态
    const latestFollowUp = salesProject.followUps.sort(
      (a, b) => b.followUpTime.getTime() - a.followUpTime.getTime(),
    )[0];

    return latestFollowUp.progress;
  }
}