import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectReportService } from './project-report.service';
import { ProjectReport } from './project-report.entity';

@ApiTags('project-reports')
@Controller('project-reports')
export class ProjectReportController {
  constructor(private readonly projectReportService: ProjectReportService) {}

  @Get()
  @ApiOperation({ summary: '获取所有项目报告' })
  @ApiResponse({ status: 200, description: '成功获取项目报告列表' })
  findAll(): Promise<ProjectReport[]> {
    return this.projectReportService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取项目报告' })
  @ApiResponse({ status: 200, description: '成功获取项目报告' })
  @ApiResponse({ status: 404, description: '项目报告未找到' })
  async findOne(@Param('id') id: string): Promise<ProjectReport> {
    const projectReport = await this.projectReportService.findOne(+id);
    if (!projectReport) {
      throw new NotFoundException(`ProjectReport with ID ${id} not found`);
    }
    return projectReport;
  }

  @Post()
  @ApiOperation({ summary: '创建项目报告' })
  @ApiResponse({ status: 201, description: '成功创建项目报告' })
  create(@Body() projectReport: ProjectReport): Promise<ProjectReport> {
    return this.projectReportService.create(projectReport);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目报告信息' })
  @ApiResponse({ status: 200, description: '成功更新项目报告' })
  @ApiResponse({ status: 404, description: '项目报告未找到' })
  async update(@Param('id') id: string, @Body() projectReport: ProjectReport): Promise<ProjectReport> {
    const updatedProjectReport = await this.projectReportService.update(+id, projectReport);
    if (!updatedProjectReport) {
      throw new NotFoundException(`ProjectReport with ID ${id} not found`);
    }
    return updatedProjectReport;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目报告' })
  @ApiResponse({ status: 204, description: '成功删除项目报告' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectReportService.remove(+id);
  }
} 