import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { Contract } from './contract.entity';

@ApiTags('contract')
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  @ApiOperation({ 
    summary: '获取所有合同',
    description: '获取所有合同的列表，包含完整的合同信息。'
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取合同列表',
    type: [Contract]
  })
  async findAll(): Promise<Contract[]> {
    return this.contractService.findAll();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '根据ID获取合同',
    description: '根据ID获取单个合同的详细信息。'
  })
  @ApiParam({
    name: 'id',
    description: '合同ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取合同',
    type: Contract
  })
  @ApiResponse({ status: 404, description: '合同未找到' })
  async findOne(@Param('id') id: number): Promise<Contract> {
    return this.contractService.findOne(id);
  }

  @Get('sales-project/:salesProjectId')
  @ApiOperation({ 
    summary: '根据销售项目ID获取相关合同',
    description: '根据销售项目ID获取该项目关联的所有合同列表。'
  })
  @ApiParam({
    name: 'salesProjectId',
    description: '销售项目ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功获取销售项目相关合同列表，包含完整的合同信息。',
    type: [Contract]
  })
  @ApiResponse({ status: 404, description: '销售项目未找到' })
  async findBySalesProject(@Param('salesProjectId') salesProjectId: number): Promise<Contract[]> {
    return this.contractService.findBySalesProject(salesProjectId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '创建合同',
    description: '创建新的合同。'
  })
  @ApiResponse({ 
    status: 201, 
    description: '成功创建合同',
    type: Contract
  })
  @ApiBody({ 
    type: CreateContractDto,
    description: '合同创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建合同',
        value: {
          salesProjectId: 1,
          contractNumber: 'HT-2024-001',
          contractAmount: 50000,
          signDate: '2024-01-15',
          description: '某小区防水工程合同'
        }
      }
    }
  })
  async create(@Body() createDto: CreateContractDto): Promise<Contract> {
    return this.contractService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新合同信息',
    description: '更新现有合同的信息。'
  })
  @ApiParam({
    name: 'id',
    description: '合同ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '成功更新合同',
    type: Contract
  })
  @ApiResponse({ status: 404, description: '合同未找到' })
  @ApiBody({ 
    type: UpdateContractDto,
    description: '合同更新参数',
    examples: {
      example1: {
        summary: '示例 - 更新合同',
        value: {
          contractAmount: 55000,
          description: '某小区防水工程合同（修改后）'
        }
      }
    }
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateContractDto,
  ): Promise<Contract> {
    return this.contractService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '删除合同',
    description: '根据ID删除合同。'
  })
  @ApiParam({
    name: 'id',
    description: '合同ID',
    type: 'number',
    example: 1
  })
  @ApiResponse({ status: 204, description: '成功删除合同' })
  @ApiResponse({ status: 404, description: '合同未找到' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.contractService.remove(id);
  }
}