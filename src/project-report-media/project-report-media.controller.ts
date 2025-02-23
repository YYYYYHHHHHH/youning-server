import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { ProjectReportMediaService } from './project-report-media.service';
import { ProjectReportMedia } from './project-report-media.entity';
import { CreateProjectReportMediaDto } from './project-report-media.dto';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

// 修改查询 DTO，只需要项目ID和创建人ID
export class FindMediaQueryDto {
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

export class FindMediasByProjectQueryDto {
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

@ApiTags('project-report-medias')
@Controller('project-report-medias')
export class ProjectReportMediaController {
  constructor(
    private readonly projectReportMediaService: ProjectReportMediaService,
  ) {}

  @Get('today')
  @ApiOperation({
    summary: '查找今日项目报告媒体',
    description: '根据项目ID和创建人ID查找今日的项目报告媒体',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告媒体列表',
    type: [ProjectReportMedia],
  })
  async findTodayByProjectAndCreator(
    @Query() query: FindMediaQueryDto,
  ): Promise<ProjectReportMedia[]> {
    const today = new Date();
    console.log(today);
    const medias =
      await this.projectReportMediaService.findByDateAndProjectAndCreator(
        today,
        query.projectId,
        query.createById,
      );

    if (!medias.length) {
      throw new NotFoundException(
        `No project report medias found for today, project ${query.projectId} and creator ${query.createById}`,
      );
    }

    return medias;
  }

  @Get()
  @ApiOperation({
    summary: '获取所有项目报告媒体',
    description: '获取所有项目报告媒体的列表，包含关联的项目报告和媒体信息。',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告媒体列表，包含完整的关联信息。',
  })
  findAll(): Promise<ProjectReportMedia[]> {
    return this.projectReportMediaService.findAll();
  }

  // @Get(':id')
  // @ApiOperation({
  //   summary: '根据ID获取项目报告媒体',
  //   description:
  //     '根据ID获取单个项目报告媒体的详细信息，包含关联的项目报告和媒体信息。',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '成功获取项目报告媒体信息，包含完整的关联信息。',
  // })
  // @ApiResponse({ status: 404, description: '项目报告媒体未找到' })
  // async findOne(@Param('id') id: string): Promise<ProjectReportMedia> {
  //   const projectReportMedia =
  //     await this.projectReportMediaService.findOne(+id);
  //   if (!projectReportMedia) {
  //     throw new NotFoundException(`ProjectReportMedia with ID ${id} not found`);
  //   }
  //   return projectReportMedia;
  // }

  @Post()
  @ApiOperation({
    summary: '创建项目报告媒体',
    description: '创建新的项目报告媒体关联关系。',
  })
  @ApiResponse({
    status: 201,
    description: '成功创建项目报告媒体关联。',
  })
  @ApiBody({ type: CreateProjectReportMediaDto })
  create(
    @Body() createProjectReportMediaDto: CreateProjectReportMediaDto,
  ): Promise<ProjectReportMedia> {
    return this.projectReportMediaService.create(createProjectReportMediaDto);
  }

  // @Put(':id')
  // @ApiOperation({
  //   summary: '更新项目报告媒体信息',
  //   description: '更新项目报告媒体的关联关系。',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '成功更新项目报告媒体关联。',
  // })
  // @ApiResponse({ status: 404, description: '项目报告媒体未找到' })
  // @ApiBody({ type: CreateProjectReportMediaDto })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateProjectReportMediaDto: CreateProjectReportMediaDto,
  // ): Promise<ProjectReportMedia> {
  //   const updatedProjectReportMedia =
  //     await this.projectReportMediaService.update(
  //       +id,
  //       updateProjectReportMediaDto,
  //     );
  //   if (!updatedProjectReportMedia) {
  //     throw new NotFoundException(`ProjectReportMedia with ID ${id} not found`);
  //   }
  //   return updatedProjectReportMedia;
  // }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目报告媒体' })
  @ApiResponse({ status: 204, description: '成功删除项目报告媒体' })
  remove(@Param('id') id: string): Promise<void> {
    return this.projectReportMediaService.remove(+id);
  }

  @Get('by-project')
  @ApiOperation({
    summary: '查找项目所有报告媒体',
    description: '根据项目ID和创建人ID查找所有报告媒体',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目报告媒体列表',
    type: [ProjectReportMedia],
  })
  async findByProjectAndCreator(
    @Query() query: FindMediasByProjectQueryDto,
  ): Promise<ProjectReportMedia[]> {
    const medias = await this.projectReportMediaService.findByProjectAndCreator(
      query.projectId,
      query.createById,
    );

    if (!medias.length) {
      throw new NotFoundException(
        `No project report medias found for project ${query.projectId} and creator ${query.createById}`,
      );
    }

    return medias;
  }
}
