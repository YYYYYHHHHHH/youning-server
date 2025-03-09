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
import { FollowUp } from '../follow-up/follow-up.entity';

@Injectable()
export class SalesProjectService {
  constructor(
    @InjectRepository(SalesProject)
    private salesProjectRepository: Repository<SalesProject>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(FollowUp)
    private followUpRepository: Repository<FollowUp>,
  ) {}

  async findAll(): Promise<SalesProject[]> {
    const projects = await this.salesProjectRepository.find({
      relations: ['salesman', 'media', 'contracts', 'followUps', 'projectPhotos'],
      order: {
        createTime: 'DESC',
      },
    });
    
    // 为每个项目添加最新更新时间信息
    for (const project of projects) {
      project['updateTime'] = await this.getLatestUpdateTime(project.id);
    }
    
    return projects;
  }

  async findOne(id: number): Promise<SalesProject> {
    // 使用QueryBuilder实现关联查询，包括跟进记录的创建人信息和图片信息
    const salesProject = await this.salesProjectRepository
      .createQueryBuilder('salesProject')// 创建查询构建器，'salesProject'是主实体的别名
      .leftJoinAndSelect('salesProject.salesman', 'salesman')// 关联销售人员信息并选择所有字段
      .leftJoinAndSelect('salesProject.media', 'media')// 关联媒体信息并选择所有字段
      .leftJoinAndSelect('salesProject.contracts', 'contracts')// 关联合同信息并选择所有字段
      .leftJoinAndSelect('salesProject.projectPhotos', 'projectPhotos')// 关联项目照片并选择所有字段
      .leftJoinAndSelect('salesProject.followUps', 'followUps') // 关联跟进记录并选择所有字段
      .leftJoinAndSelect('followUps.followUpMedias', 'followUpMedias') // 关联跟进记录的图片关联信息
      .leftJoinAndSelect('followUpMedias.media', 'followUpMedia') // 关联跟进记录的具体图片信息
      .leftJoin('followUps.createBy', 'createBy')// 关联跟进记录的创建人，但不自动选择所有字段
      .addSelect('createBy.name')// 只选择创建人的名字字段，减少数据传输量
      .where('salesProject.id = :id', { id })// 根据ID筛选特定销售项目
      .getOne(); // 执行查询并获取单个结果

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    // 添加最新更新时间信息
    salesProject['updateTime'] = await this.getLatestUpdateTime(id);

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

    // 保存销售项目
    const savedProject = await this.salesProjectRepository.save(salesProject);
    
    // 创建初始跟进记录
    const followUp = this.followUpRepository.create({
      progress: Progress.NEW, // 使用'新建'状态
      remark: '项目创建',
      followUpTime: new Date(),
      salesProject: savedProject,
      createById: salesman.id,
    });
    
    // 保存跟进记录
    const savedFollowUp = await this.followUpRepository.save(followUp);
    
    // 重新查询销售项目，包含跟进记录
    const result = await this.salesProjectRepository.findOne({
      where: { id: savedProject.id },
      relations: ['salesman', 'media', 'contracts', 'followUps', 'projectPhotos'],
    });
    
    if (!result) {
      throw new BusinessException(
        `创建后无法找到销售项目ID ${savedProject.id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    return result;
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
  
  /**
   * 获取销售项目的最新更新时间（基于最新的跟进记录时间）
   * @param id 销售项目ID
   * @returns 最新更新时间，如果没有跟进记录则返回null
   */
  async getLatestUpdateTime(id: number): Promise<Date | null> {
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id },
      relations: ['followUps'],
    });

    if (!salesProject || !salesProject.followUps || salesProject.followUps.length === 0) {
      return null;
    }

    // 按照跟进时间降序排序，获取最新的跟进时间
    const latestFollowUp = salesProject.followUps.sort(
      (a, b) => b.followUpTime.getTime() - a.followUpTime.getTime(),
    )[0];

    return latestFollowUp.followUpTime;
  }
}