import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProjectReportPersonService } from './project-report-person.service';
import { ProjectReportPerson } from './project-report-person.entity';
import { CreateProjectReportPersonDto } from './project-report-person.dto';

@ApiTags('project-report-persons')
@Controller('project-report-persons')
export class ProjectReportPersonController {
  constructor(
    private readonly projectReportPersonService: ProjectReportPersonService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有项目报告人员' })
  @ApiResponse({ status: 200, description: '成功获取项目报告人员列表' })
  findAll(): Promise<ProjectReportPerson[]> {
    return this.projectReportPersonService.findAll();
  }

  @Get('work-summary')
  @ApiOperation({ summary: '获取所有人员的工时汇总' })
  @ApiResponse({ status: 200, description: '成功获取人员工时汇总列表' })
  async getWorkSummary(): Promise<any[]> {
    return this.projectReportPersonService.getWorkSummary();
  }

  @Get('person/:personId')
  @ApiOperation({ summary: '根据人员ID获取工时记录' })
  @ApiResponse({ status: 200, description: '成功获取人员工时记录列表' })
  @ApiResponse({ status: 404, description: '未找到相关工时记录' })
  async findByPersonId(@Param('personId') personId: string): Promise<ProjectReportPerson[]> {
    const reportPersons = await this.projectReportPersonService.findByPersonId(+personId);
    if (!reportPersons || reportPersons.length === 0) {
      throw new NotFoundException(`No work records found for person with ID ${personId}`);
    }
    return reportPersons;
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: '根据项目ID获取项目报告人员情况' })
  @ApiResponse({ status: 200, description: '成功获取项目报告人员列表' })
  @ApiResponse({ status: 404, description: '未找到相关项目报告人员记录' })
  async findByProjectId(@Param('projectId') projectId: string): Promise<ProjectReportPerson[]> {
    const reportPersons = await this.projectReportPersonService.findByProjectId(+projectId);
    if (!reportPersons || reportPersons.length === 0) {
      throw new NotFoundException(`No person records found for project with ID ${projectId}`);
    }
    return reportPersons;
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取项目报告人员' })
  @ApiResponse({ status: 200, description: '成功获取项目报告人员' })
  @ApiResponse({ status: 404, description: '项目报告人员未找到' })
  async findOne(@Param('id') id: string): Promise<ProjectReportPerson> {
    const projectReportPerson =
      await this.projectReportPersonService.findOne(+id);
    if (!projectReportPerson) {
      throw new NotFoundException(
        `ProjectReportPerson with ID ${id} not found`,
      );
    }
    return projectReportPerson;
  }

  @Post()
  @ApiOperation({ summary: '创建项目报告人员' })
  @ApiResponse({ status: 201, description: '成功创建项目报告人员' })
  create(
    @Body() projectReportPerson: CreateProjectReportPersonDto,
  ): Promise<ProjectReportPerson> {
    return this.projectReportPersonService.create(projectReportPerson);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目报告人员信息' })
  @ApiResponse({ status: 200, description: '成功更新项目报告人员' })
  @ApiResponse({ status: 404, description: '项目报告人员未找到' })
  async update(
    @Param('id') id: string,
    @Body() projectReportPerson: ProjectReportPerson,
  ): Promise<ProjectReportPerson> {
    const updatedProjectReportPerson =
      await this.projectReportPersonService.update(+id, projectReportPerson);
    if (!updatedProjectReportPerson) {
      throw new NotFoundException(
        `ProjectReportPerson with ID ${id} not found`,
      );
    }
    return updatedProjectReportPerson;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目报告人员' })
  @ApiResponse({ status: 204, description: '成功删除项目报告人员' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectReportPersonService.remove(+id);
  }
}
