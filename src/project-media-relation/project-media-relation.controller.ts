import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ProjectMediaRelationService } from './project-media-relation.service';
import { CreateProjectMediaRelationDto } from './project-media-relation.dto';
import { Media } from '../media/media.entity';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('项目媒体关系')
@Controller('project-media-relations')
export class ProjectMediaRelationController {
  constructor(
    private readonly projectMediaRelationService: ProjectMediaRelationService,
  ) {}

  @ApiOperation({
    summary: '获取项目的所有媒体文件',
    description: '根据项目ID获取该项目关联的所有媒体文件列表',
  })
  @ApiParam({
    name: 'projectId',
    description: '项目ID',
    type: 'number',
    example: 1,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '返回项目的媒体文件列表',
  })
  @ApiResponse({ status: 404, description: '项目未找到' })
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: number): Promise<Media[]> {
    return this.projectMediaRelationService.findByProject(projectId);
  }

  @ApiOperation({
    summary: '创建项目媒体关系',
    description: '创建项目与媒体文件的关联关系',
  })
  @ApiBody({
    type: CreateProjectMediaRelationDto,
    description: '项目媒体关系创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建项目媒体关系',
        value: {
          projectId: 1,
          mediaId: 1,
        },
      },
    },
  })

  @ApiResponse({ status: 400, description: '参数验证失败' })
  @Post()
  create(@Body() createDto: CreateProjectMediaRelationDto) {
    return this.projectMediaRelationService.create(createDto);
  }

  @ApiOperation({
    summary: '删除项目媒体关系',
    description: '根据项目ID和媒体文件ID删除它们之间的关联关系',
  })
  @ApiParam({
    name: 'projectId',
    description: '项目ID',
    type: 'number',
    example: 1,
    required: true,
  })
  @ApiParam({
    name: 'mediaId',
    description: '媒体文件ID',
    type: 'number',
    example: 1,
    required: true,
  })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '项目媒体关系未找到' })
  @Delete('project/:projectId/media/:mediaId')
  remove(
    @Param('projectId') projectId: number,
    @Param('mediaId') mediaId: number,
  ): Promise<void> {
    return this.projectMediaRelationService.remove(projectId, mediaId);
  }
}