import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ProjectPhotoService } from './project-photo.service';
import { CreateProjectPhotoDto, UpdateProjectPhotoDto } from './project-photo.dto';
import { ProjectPhoto } from './project-photo.entity';

@ApiTags('project-photos')
@Controller('project-photos')
export class ProjectPhotoController {
  constructor(private readonly projectPhotoService: ProjectPhotoService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有项目照片关联',
    description: '获取所有项目照片关联的列表，包含关联的项目和照片信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取项目照片关联列表，包含完整的关联信息。',
    type: [ProjectPhoto]
  })
  async findAll(): Promise<ProjectPhoto[]> {
    return this.projectPhotoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取项目照片关联',
    description: '根据ID获取单个项目照片关联的详细信息，包含关联的项目和照片信息。'
  })
  @ApiParam({
    name: 'id',
    description: '项目照片关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取项目照片关联信息，包含完整的关联信息。',
    type: ProjectPhoto
  })
  @ApiResponse({ status: 404, description: '项目照片关联未找到' })
  async findOne(@Param('id') id: number): Promise<ProjectPhoto> {
    return this.projectPhotoService.findOne(id);
  }

  @Get('sales-project/:salesProjectId')
  @ApiOperation({ 
    summary: '根据销售项目ID获取相关照片关联',
    description: '根据销售项目ID获取该项目关联的所有照片关联列表。'
  })
  @ApiParam({
    name: 'salesProjectId',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取销售项目相关照片关联列表，包含完整的关联信息。',
    type: [ProjectPhoto]
  })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  async findBySalesProjectId(@Param('salesProjectId') salesProjectId: number): Promise<ProjectPhoto[]> {
    return this.projectPhotoService.findBySalesProjectId(salesProjectId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建项目照片关联',
    description: '创建新的项目照片关联关系。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建项目照片关联。',
    type: ProjectPhoto
  })
  @ApiBody({ 
    type: CreateProjectPhotoDto,
    description: '项目照片关联创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建项目照片关联',
        value: {
          salesProjectId: 1,
          photoId: 1
        }
      }
    }
  })
  async create(@Body() createDto: CreateProjectPhotoDto): Promise<ProjectPhoto> {
    return this.projectPhotoService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新项目照片关联',
    description: '更新项目照片关联的关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '项目照片关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新项目照片关联。',
    type: ProjectPhoto
  })
  @ApiResponse({ status: 404, description: '项目照片关联未找到' })
  @ApiBody({ 
    type: UpdateProjectPhotoDto,
    description: '项目照片关联更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新项目照片关联',
        value: {
          salesProjectId: 2,
          photoId: 3
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateProjectPhotoDto,
  ): Promise<ProjectPhoto> {
    return this.projectPhotoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除项目照片关联',
    description: '根据ID删除项目照片关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '项目照片关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除项目照片关联' })
  @ApiResponse({ status: 404, description: '项目照片关联未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.projectPhotoService.remove(id);
  }
}