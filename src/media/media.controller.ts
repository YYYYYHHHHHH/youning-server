import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Media } from './media.entity';

@ApiTags('medias')
@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: '获取所有媒体' })
  @ApiResponse({ status: 200, description: '成功获取媒体列表' })
  findAll(): Promise<Media[]> {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取媒体' })
  @ApiResponse({ status: 200, description: '成功获取媒体' })
  @ApiResponse({ status: 404, description: '媒体未找到' })
  async findOne(@Param('id') id: string): Promise<Media> {
    const media = await this.mediaService.findOne(+id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  @Post()
  @ApiOperation({ summary: '创建媒体' })
  @ApiResponse({ status: 201, description: '成功创建媒体' })
  create(@Body() media: Media): Promise<Media> {
    return this.mediaService.create(media);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新媒体信息' })
  @ApiResponse({ status: 200, description: '成功更新媒体' })
  @ApiResponse({ status: 404, description: '媒体未找到' })
  async update(@Param('id') id: string, @Body() media: Media): Promise<Media> {
    const updatedMedia = await this.mediaService.update(+id, media);
    if (!updatedMedia) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return updatedMedia;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除媒体' })
  @ApiResponse({ status: 204, description: '成功删除媒体' })
  remove(@Param('id') id: string): Promise<void> {
    return this.mediaService.remove(+id);
  }
} 