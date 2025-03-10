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
  })
  @ApiBody({ 
    type: CreateContractDto,
    description: '合同创建参数',
    examples: {
      example1: {
        summary: '示例 - 创建合同',
        value: {
          salesProjectId: 1,
          partyAName: '张三',
          partyAPhone: '13800138000',
          contractAmount: 50000,
          startDate: '2024-01-20',
          endDate: '2024-03-20',
          signatoryId: 1,
          constructionSite: '某市某区某小区A栋',
          signingTime: '2024-01-15',
          remarks: '包含地下室防水和屋顶防水工程',
        }
      }
    }
  })
  async create(@Body() createDto: CreateContractDto): Promise<Contract> {
    return this.contractService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: '更新合同',
    description: '根据ID更新合同信息。'
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
          salesProjectId: 1,
          partyAName: '李四',
          partyAPhone: '13900139000',
          contractAmount: 60000,
          startDate: '2024-02-01',
          endDate: '2024-04-01',
          signatoryId: 2,
          constructionSite: '某市某区某小区B栋',
          signingTime: '2024-01-20',
          remarks: '增加了卫生间防水工程'
        }
      }
    }
  })
  async update(@Param('id') id: number, @Body() updateDto: UpdateContractDto): Promise<Contract> {
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