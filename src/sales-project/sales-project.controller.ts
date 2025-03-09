import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { SalesProjectService } from './sales-project.service';
import { CreateSalesProjectDto, UpdateSalesProjectDto } from './sales-project.dto';
import { SalesProject } from './sales-project.entity';

@ApiTags('sales-project')
@Controller('sales-project')
export class SalesProjectController {
  constructor(private readonly salesProjectService: SalesProjectService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有销售项目',
    description: '获取所有销售项目的列表，包含完整的项目信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取销售项目列表'
  })
  async findAll(): Promise<SalesProject[]> {
    return this.salesProjectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取销售项目',
    description: '根据ID获取单个销售项目的详细信息。'
  })
  @ApiParam({
    name: 'id',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取销售项目'
  })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  async findOne(@Param('id') id: number): Promise<SalesProject> {
    return this.salesProjectService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建销售项目',
    description: '创建新的销售项目。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建销售项目'
  })
  @ApiBody({ 
    type: CreateSalesProjectDto,
    description: '销售项目创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建销售项目',
        value: {
          projectName: '某小区防水工程',
          customerName: '张三',
          contactNumber: '13800138000',
          site: '北京市朝阳区某小区',
          salesmanId: 1,
          mediaId: 1
        }
      }
    }
  })
  async create(@Body() createDto: CreateSalesProjectDto): Promise<SalesProject> {
    return this.salesProjectService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新销售项目信息',
    description: '更新现有销售项目的信息。'
  })
  @ApiParam({
    name: 'id',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新销售项目'
  })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  @ApiBody({ 
    type: UpdateSalesProjectDto,
    description: '销售项目更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新销售项目',
        value: {
          projectName: '某小区防水工程（修改后）',
          customerName: '张三',
          contactNumber: '13800138000',
          site: '北京市朝阳区某小区（修改后）',
          salesmanId: 1,
          mediaId: 1
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateSalesProjectDto,
  ): Promise<SalesProject> {
    return this.salesProjectService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除销售项目',
    description: '根据ID删除销售项目及其关联的跟进记录。'
  })
  @ApiParam({
    name: 'id',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除销售项目及其关联数据' })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.salesProjectService.remove(id);
  }
}