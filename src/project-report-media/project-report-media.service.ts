import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProjectReportMedia } from './project-report-media.entity';
import { ProjectReport } from '../project-report/project-report.entity';
import { Media } from '../media/media.entity';
import { CreateProjectReportMediaDto } from './project-report-media.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class ProjectReportMediaService {
  constructor(
    @InjectRepository(ProjectReportMedia)
    private projectReportMediaRepository: Repository<ProjectReportMedia>,
    @InjectRepository(ProjectReport)
    private projectReportRepository: Repository<ProjectReport>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  findAll(): Promise<ProjectReportMedia[]> {
    return this.projectReportMediaRepository.find({
      relations: ['projectReport', 'media'],
    });
  }

  async findOne(id: number): Promise<ProjectReportMedia | null> {
    const projectReportMedia = await this.projectReportMediaRepository.findOne({
      where: { id },
      relations: ['projectReport', 'media'],
    });
    if (!projectReportMedia) {
      throw new BusinessException(
        `ProjectReportMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return projectReportMedia;
  }

  async create(
    createProjectReportMediaDto: CreateProjectReportMediaDto,
  ): Promise<ProjectReportMedia> {
    const projectReportMedia = new ProjectReportMedia();

    // 查找并设置媒体
    const media = await this.mediaRepository.findOneBy({
      id: createProjectReportMediaDto.mediaId,
    });
    if (!media) {
      throw new BusinessException(
        `Media with ID ${createProjectReportMediaDto.mediaId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 获取当天的开始和结束时间
    const today = new Date();
    const startTime = startOfDay(today);
    const endTime = endOfDay(today);

    // 查找当天的项目报告
    let projectReport = await this.projectReportRepository.findOne({
      where: {
        createTime: Between(startTime, endTime),
        project: { id: createProjectReportMediaDto.projectId },
        createBy: { id: createProjectReportMediaDto.createById },
      },
      relations: ['project', 'createBy'],
    });

    // 如果没有找到当天的报告，创建一个新的
    if (!projectReport) {
      projectReport = new ProjectReport();
      projectReport.createTime = today;
      projectReport.project = {
        id: createProjectReportMediaDto.projectId,
      } as any;
      projectReport.createBy = {
        id: createProjectReportMediaDto.createById,
      } as any;
      projectReport = await this.projectReportRepository.save(projectReport);
    }

    projectReportMedia.projectReport = projectReport;
    projectReportMedia.media = media;

    return this.projectReportMediaRepository.save(projectReportMedia);
  }

  async update(
    id: number,
    updateProjectReportMediaDto: CreateProjectReportMediaDto,
  ): Promise<ProjectReportMedia> {
    const projectReportMedia = await this.projectReportMediaRepository.findOne({
      where: { id },
      relations: ['projectReport', 'media'],
    });

    if (!projectReportMedia) {
      throw new BusinessException(
        `ProjectReportMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置项目报告
    const projectReport = await this.projectReportRepository.findOne({
      where: {
        project: { id: updateProjectReportMediaDto.projectId },
        createBy: { id: updateProjectReportMediaDto.createById },
      },
      relations: ['project', 'createBy'],
    });
    if (!projectReport) {
      throw new BusinessException(
        `ProjectReport not found for project ${updateProjectReportMediaDto.projectId} and person ${updateProjectReportMediaDto.createById}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 查找并设置媒体
    const media = await this.mediaRepository.findOneBy({
      id: updateProjectReportMediaDto.mediaId,
    });
    if (!media) {
      throw new BusinessException(
        `Media with ID ${updateProjectReportMediaDto.mediaId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    projectReportMedia.projectReport = projectReport;
    projectReportMedia.media = media;

    await this.projectReportMediaRepository.save(projectReportMedia);
    const result = await this.projectReportMediaRepository.findOne({
      where: { id },
      relations: ['projectReport', 'media'],
    });
    if (!result) {
      throw new BusinessException(
        `ProjectReportMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    const projectReportMedia =
      await this.projectReportMediaRepository.findOneBy({
        id,
      });
    if (!projectReportMedia) {
      throw new BusinessException(
        `ProjectReportMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.projectReportMediaRepository.delete(id);
  }
}
