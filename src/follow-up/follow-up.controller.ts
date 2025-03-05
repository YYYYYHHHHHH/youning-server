import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { FollowUpService } from './follow-up.service';
import { CreateFollowUpDto, UpdateFollowUpDto } from './follow-up.dto';
import { FollowUp } from './follow-up.entity';

@ApiTags('follow-up')
@Controller('follow-up')
export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有跟进记录',
    description: '获取所有跟进记录的列表，包含完整的跟进信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取跟进记录列表',
    type: [FollowUp]
  })
  async findAll(): Promise<FollowUp[]> {
    return this.followUpService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取跟进记录',
    description: '根据ID获取单个跟进记录的详细信息。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进记录ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取跟进记录',
    type: FollowUp
  })
  @ApiResponse({ status: 404, description: '跟进记录未找到' })
  async findOne(@Param('id') id: number): Promise<FollowUp> {
    return this.followUpService.findOne(id);
  }

  @Get('sales-project/:salesProjectId')
  @ApiOperation({ 
    summary: '根据销售项目ID获取跟进记录',
    description: '获取指定销售项目的所有跟进记录列表。'
  })
  @ApiParam({
    name: 'salesProjectId',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取销售项目的跟进记录列表',
    type: [FollowUp]
  })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  async findBySalesProject(@Param('salesProjectId') salesProjectId: number): Promise<FollowUp[]> {
    return this.followUpService.findBySalesProject(salesProjectId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建跟进记录',
    description: '创建新的跟进记录。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建跟进记录',
    type: FollowUp
  })
  @ApiBody({ 
    type: CreateFollowUpDto,
    description: '跟进记录创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建跟进记录',
        value: {
          salesProjectId: 1,
          content: '客户对项目表示满意',
          nextFollowUpDate: '2024-01-20'
        }
      }
    }
  })
  async create(@Body() createDto: CreateFollowUpDto): Promise<FollowUp> {
    return this.followUpService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新跟进记录',
    description: '更新现有跟进记录的信息。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进记录ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新跟进记录',
    type: FollowUp
  })
  @ApiResponse({ status: 404, description: '跟进记录未找到' })
  @ApiBody({ 
    type: UpdateFollowUpDto,
    description: '跟进记录更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新跟进记录',
        value: {
          content: '客户要求修改部分细节',
          nextFollowUpDate: '2024-01-25'
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateFollowUpDto,
  ): Promise<FollowUp> {
    return this.followUpService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除跟进记录',
    description: '根据ID删除跟进记录。'
  })
  @ApiParam({
    name: 'id',
    description: '跟进记录ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除跟进记录' })
  @ApiResponse({ status: 404, description: '跟进记录未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.followUpService.remove(id);
  }
}