import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { FollowUpMediaService } from './follow-up-media.service';
import { CreateFollowUpMediaDto, UpdateFollowUpMediaDto } from './follow-up-media.dto';
import { FollowUpMedia } from './follow-up-media.entity';

@ApiTags('follow-up-media')
@Controller('follow-up-media')
export class FollowUpMediaController {
  constructor(private readonly followUpMediaService: FollowUpMediaService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有跟进媒体关联',
    description: '获取所有跟进媒体关联的列表，包含关联的跟进和媒体信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取跟进媒体关联列表，包含完整的关联信息。',
    type: [FollowUpMedia]
  })
  async findAll(): Promise<FollowUpMedia[]> {
    return this.followUpMediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取跟进媒体关联',
    description: '根据ID获取单个跟进媒体关联的详细信息，包含关联的跟进和媒体信息。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取跟进媒体关联信息，包含完整的关联信息。',
    type: FollowUpMedia
  })
  @ApiResponse({ status: 404, description: '跟进媒体关联未找到' })
  async findOne(@Param('id') id: number): Promise<FollowUpMedia> {
    return this.followUpMediaService.findOne(id);
  }

  @Get('follow-up/:followUpId')
  @ApiOperation({ 
    summary: '根据跟进ID获取相关媒体关联',
    description: '根据跟进ID获取该跟进记录关联的所有媒体关联列表。'
  })
  @ApiParam({
    name: 'followUpId',
    description: '跟进记录ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取跟进相关媒体关联列表，包含完整的关联信息。',
    type: [FollowUpMedia]
  })
  @ApiResponse({ status: 404, description: '跟进记录未找到' })
  async findByFollowUpId(@Param('followUpId') followUpId: number): Promise<FollowUpMedia[]> {
    return this.followUpMediaService.findByFollowUpId(followUpId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建跟进媒体关联',
    description: '创建新的跟进媒体关联关系。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建跟进媒体关联。',
    type: FollowUpMedia
  })
  @ApiBody({ 
    type: CreateFollowUpMediaDto,
    description: '跟进媒体关联创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建跟进媒体关联',
        value: {
          followUpId: 1,
          mediaId: 1
        }
      }
    }
  })
  async create(@Body() createDto: CreateFollowUpMediaDto): Promise<FollowUpMedia> {
    return this.followUpMediaService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新跟进媒体关联',
    description: '更新跟进媒体关联的关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新跟进媒体关联。',
    type: FollowUpMedia
  })
  @ApiResponse({ status: 404, description: '跟进媒体关联未找到' })
  @ApiBody({ 
    type: UpdateFollowUpMediaDto,
    description: '跟进媒体关联更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新跟进媒体关联',
        value: {
          followUpId: 2,
          mediaId: 3
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateFollowUpMediaDto,
  ): Promise<FollowUpMedia> {
    return this.followUpMediaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除跟进媒体关联',
    description: '根据ID删除跟进媒体关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除跟进媒体关联' })
  @ApiResponse({ status: 404, description: '跟进媒体关联未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.followUpMediaService.remove(id);
  }
}