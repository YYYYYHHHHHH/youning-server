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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProjectReportService } from './project-report.service';
import { ProjectReport } from './project-report.entity';
import { CreateProjectReportDto } from './project-report.dto';

@ApiTags('project-reports')
@Controller('project-reports')
export class ProjectReportController {
  constructor(private readonly projectReportService: ProjectReportService) {}

  @Get()
  @ApiOperation({
    summary: '获取所有项目报告',
    description: '获取所有项目报告的列表，包含关联的项目和人员信息。',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告列表，包含完整的关联信息。',
  })
  findAll(): Promise<ProjectReport[]> {
    return this.projectReportService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取项目报告',
    description: '根据ID获取单个项目报告的详细信息，包含关联的项目和人员信息。',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告信息，包含完整的关联信息。',
  })
  @ApiResponse({ status: 404, description: '项目报告未找到' })
  async findOne(@Param('id') id: string): Promise<ProjectReport> {
    const projectReport = await this.projectReportService.findOne(+id);
    if (!projectReport) {
      throw new NotFoundException(`ProjectReport with ID ${id} not found`);
    }
    return projectReport;
  }

  @Post()
  @ApiOperation({
    summary: '创建项目报告',
    description: '创建新的项目报告，需要关联项目和人员。',
  })
  @ApiResponse({
    status: 201,
    description: '成功创建项目报告。',
  })
  @ApiBody({ type: CreateProjectReportDto })
  create(@Body() createProjectReportDto: CreateProjectReportDto): Promise<ProjectReport> {
    return this.projectReportService.create(createProjectReportDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新项目报告信息',
    description: '更新项目报告信息，包括关联的项目和人员。',
  })
  @ApiResponse({
    status: 200,
    description: '成功更新项目报告信息。',
  })
  @ApiResponse({ status: 404, description: '项目报告未找到' })
  @ApiBody({ type: CreateProjectReportDto })
  async update(
    @Param('id') id: string,
    @Body() updateProjectReportDto: CreateProjectReportDto,
  ): Promise<ProjectReport> {
    const updatedProjectReport = await this.projectReportService.update(
      +id,
      updateProjectReportDto,
    );
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