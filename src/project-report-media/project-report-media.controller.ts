import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectReportMediaService } from './project-report-media.service';
import { ProjectReportMedia } from './project-report-media.entity';

@ApiTags('project-report-medias')
@Controller('project-report-medias')
export class ProjectReportMediaController {
  constructor(private readonly projectReportMediaService: ProjectReportMediaService) {}

  @Get()
  @ApiOperation({ summary: '获取所有项目报告媒体' })
  @ApiResponse({ status: 200, description: '成功获取项目报告媒体列表' })
  findAll(): Promise<ProjectReportMedia[]> {
    return this.projectReportMediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取项目报告媒体' })
  @ApiResponse({ status: 200, description: '成功获取项目报告媒体' })
  @ApiResponse({ status: 404, description: '项目报告媒体未找到' })
  async findOne(@Param('id') id: string): Promise<ProjectReportMedia> {
    const projectReportMedia = await this.projectReportMediaService.findOne(+id);
    if (!projectReportMedia) {
      throw new NotFoundException(`ProjectReportMedia with ID ${id} not found`);
    }
    return projectReportMedia;
  }

  @Post()
  @ApiOperation({ summary: '创建项目报告媒体' })
  @ApiResponse({ status: 201, description: '成功创建项目报告媒体' })
  create(@Body() projectReportMedia: ProjectReportMedia): Promise<ProjectReportMedia> {
    return this.projectReportMediaService.create(projectReportMedia);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目报告媒体信息' })
  @ApiResponse({ status: 200, description: '成功更新项目报告媒体' })
  @ApiResponse({ status: 404, description: '项目报告媒体未找到' })
  async update(@Param('id') id: string, @Body() projectReportMedia: ProjectReportMedia): Promise<ProjectReportMedia> {
    const updatedProjectReportMedia = await this.projectReportMediaService.update(+id, projectReportMedia);
    if (!updatedProjectReportMedia) {
      throw new NotFoundException(`ProjectReportMedia with ID ${id} not found`);
    }
    return updatedProjectReportMedia;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目报告媒体' })
  @ApiResponse({ status: 204, description: '成功删除项目报告媒体' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectReportMediaService.remove(+id);
  }
} 