import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUp } from './follow-up.entity';
import { SalesProject } from '../sales-project/sales-project.entity';
import { CreateFollowUpDto, UpdateFollowUpDto } from './follow-up.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class FollowUpService {
  constructor(
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
    @InjectRepository(SalesProject)
    private salesProjectRepository: Repository<SalesProject>,
  ) {}

  async findAll(): Promise<FollowUp[]> {
    return this.followUpRepository.find({
      relations: ['salesProject', 'followUpMedias', 'followUpMedias.media'],
      order: {
        followUpTime: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<FollowUp> {
    const followUp = await this.followUpRepository.findOne({
      where: { id },
      relations: ['salesProject', 'followUpMedias', 'followUpMedias.media'],
    });

    if (!followUp) {
      throw new BusinessException(
        `跟进记录ID ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    return followUp;
  }

  async findBySalesProject(salesProjectId: number): Promise<FollowUp[]> {
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.followUpRepository.find({
      where: { salesProject: { id: salesProjectId } },
      relations: ['salesProject', 'followUpMedias', 'followUpMedias.media'],
      order: {
        followUpTime: 'DESC',
      },
    });
  }

  async create(createDto: CreateFollowUpDto): Promise<FollowUp> {
    // 验证销售项目是否存在
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: createDto.salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${createDto.salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 创建跟进记录
    const followUp = this.followUpRepository.create({
      progress: createDto.progress,
      remark: createDto.remark,
      followUpTime: createDto.followUpTime,
      salesProject,
    });

    // 只更新销售项目的更新时间
    salesProject.updateTime = new Date();
    await this.salesProjectRepository.save(salesProject);

    return this.followUpRepository.save(followUp);
  }

  async update(id: number, updateDto: UpdateFollowUpDto): Promise<FollowUp> {
    const followUp = await this.findOne(id);

    // 验证销售项目是否存在
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: updateDto.salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${updateDto.salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 更新跟进记录
    Object.assign(followUp, {
      progress: updateDto.progress,
      remark: updateDto.remark,
      followUpTime: updateDto.followUpTime,
      salesProject,
    });

    // 只更新销售项目的更新时间
    salesProject.updateTime = new Date();
    await this.salesProjectRepository.save(salesProject);

    return this.followUpRepository.save(followUp);
  }

  async remove(id: number): Promise<void> {
    const followUp = await this.findOne(id);
    await this.followUpRepository.remove(followUp);
  }
}