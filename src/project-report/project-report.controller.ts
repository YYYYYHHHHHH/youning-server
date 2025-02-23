import {
  Controller,
  Get,
  Post,
  Body,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { ProjectReportService } from './project-report.service';
import { ProjectReport } from './project-report.entity';
import { CreateProjectReportDto } from './project-report.dto';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

// 修改查询 DTO，移除日期参数
export class FindReportQueryDto {
  @ApiProperty({
    description: '项目ID',
    required: true,
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  projectId!: number;

  @ApiProperty({
    description: '创建人ID',
    required: true,
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  createById!: number;
}

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
  create(
    @Body() createProjectReportDto: CreateProjectReportDto,
  ): Promise<ProjectReport> {
    return this.projectReportService.create(createProjectReportDto);
  }

  // @Put(':id')
  // @ApiOperation({
  //   summary: '更新项目报告信息',
  //   description: '更新项目报告信息，包括关联的项目和人员。',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '成功更新项目报告信息。',
  // })
  // @ApiResponse({ status: 404, description: '项目报告未找到' })
  // @ApiBody({ type: CreateProjectReportDto })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateProjectReportDto: CreateProjectReportDto,
  // ): Promise<ProjectReport> {
  //   const updatedProjectReport = await this.projectReportService.update(
  //     +id,
  //     updateProjectReportDto,
  //   );
  //   if (!updatedProjectReport) {
  //     throw new NotFoundException(`ProjectReport with ID ${id} not found`);
  //   }
  //   return updatedProjectReport;
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: '删除项目报告' })
  // @ApiResponse({ status: 204, description: '成功删除项目报告' })
  // remove(@Param('id') id: string): Promise<void> {
  //   return this.projectReportService.remove(+id);
  // }

  @Get('today')
  @ApiOperation({
    summary: '查找今日项目报告',
    description: '根据项目ID和创建人ID查找今日的项目报告',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告',
    type: ProjectReport,
  })
  @ApiResponse({ status: 404, description: '项目报告未找到' })
  async findTodayReport(
    @Query() query: FindReportQueryDto,
  ): Promise<ProjectReport> {
    const today = new Date();
    console.log('today', today);

    const projectReport =
      await this.projectReportService.findByDateAndProjectAndCreator(
        today,
        query.projectId,
        query.createById,
      );

    if (!projectReport) {
      throw new NotFoundException(
        `No project report found for today, project ${query.projectId} and creator ${query.createById}`,
      );
    }

    return projectReport;
  }
}
