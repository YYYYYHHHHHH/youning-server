import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ContractMediaService } from './contract-media.service';
import { CreateContractMediaDto, UpdateContractMediaDto } from './contract-media.dto';
import { ContractMedia } from './contract-media.entity';

@ApiTags('contract-media')
@Controller('contract-media')
export class ContractMediaController {
  constructor(private readonly contractMediaService: ContractMediaService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有合同媒体关联',
    description: '获取所有合同媒体关联的列表，包含关联的合同和媒体信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取合同媒体关联列表，包含完整的关联信息。',
    type: [ContractMedia]
  })
  async findAll(): Promise<ContractMedia[]> {
    return this.contractMediaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取合同媒体关联',
    description: '根据ID获取单个合同媒体关联的详细信息，包含关联的合同和媒体信息。'
  })
  @ApiParam({
    name: 'id',
    description: '合同媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取合同媒体关联信息，包含完整的关联信息。',
    type: ContractMedia
  })
  @ApiResponse({ status: 404, description: '合同媒体关联未找到' })
  async findOne(@Param('id') id: number): Promise<ContractMedia> {
    return this.contractMediaService.findOne(id);
  }

  @Get('contract/:contractId')
  @ApiOperation({ 
    summary: '根据合同ID获取相关媒体关联',
    description: '根据合同ID获取该合同关联的所有媒体关联列表。'
  })
  @ApiParam({
    name: 'contractId',
    description: '合同ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取合同相关媒体关联列表，包含完整的关联信息。',
    type: [ContractMedia]
  })
  @ApiResponse({ status: 404, description: '合同未找到' })
  async findByContractId(@Param('contractId') contractId: number): Promise<ContractMedia[]> {
    return this.contractMediaService.findByContractId(contractId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建合同媒体关联',
    description: '创建新的合同媒体关联关系。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建合同媒体关联。',
    type: ContractMedia
  })
  @ApiBody({ 
    type: CreateContractMediaDto,
    description: '合同媒体关联创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建合同媒体关联',
        value: {
          contractId: 1,
          mediaId: 1
        }
      }
    }
  })
  async create(@Body() createDto: CreateContractMediaDto): Promise<ContractMedia> {
    return this.contractMediaService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新合同媒体关联',
    description: '更新合同媒体关联的关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '合同媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新合同媒体关联。',
    type: ContractMedia
  })
  @ApiResponse({ status: 404, description: '合同媒体关联未找到' })
  @ApiBody({ 
    type: UpdateContractMediaDto,
    description: '合同媒体关联更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新合同媒体关联',
        value: {
          id: 1,
          contractId: 2,
          mediaId: 3
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateContractMediaDto,
  ): Promise<ContractMedia> {
    return this.contractMediaService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除合同媒体关联',
    description: '根据ID删除合同媒体关联关系。'
  })
  @ApiParam({
    name: 'id',
    description: '合同媒体关联ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除合同媒体关联' })
  @ApiResponse({ status: 404, description: '合同媒体关联未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.contractMediaService.remove(id);
  }
}