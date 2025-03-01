import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoreHistoryRecordService } from './store-history-record.service';
import { StoreHistoryRecord } from './store-history-record.entity';
import { CreateStoreHistoryRecordDto } from './store-history-record.dto';

@ApiTags('store-history-records')
@Controller('store-history-records')
export class StoreHistoryRecordController {
  constructor(
    private readonly storeHistoryRecordService: StoreHistoryRecordService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有库存历史记录' })
  @ApiResponse({ status: 200, description: '成功获取库存历史记录列表' })
  findAll(): Promise<StoreHistoryRecord[]> {
    return this.storeHistoryRecordService.findAll();
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '根据仓库ID获取库存变动记录' })
  @ApiResponse({ status: 200, description: '成功获取仓库的库存变动记录列表' })
  @ApiResponse({ status: 404, description: '未找到该仓库的变动记录' })
  async findByStoreId(@Param('storeId') storeId: string): Promise<StoreHistoryRecord[]> {
    const records = await this.storeHistoryRecordService.findByStoreId(+storeId);
    if (!records || records.length === 0) {
      throw new NotFoundException(`No history records found for store with ID ${storeId}`);
    }
    return records;
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: '根据工地ID获取该工地的仓库的库存变动记录' })
  findByProjectId(@Param('projectId') projectId: number) {
    return this.storeHistoryRecordService.findByProjectId(projectId);
  }

  @Post()
  @ApiOperation({ summary: '创建库存历史记录' })
  @ApiResponse({ status: 201, description: '成功创建库存历史记录' })
  create(
    @Body() storeHistoryRecord: CreateStoreHistoryRecordDto,
  ): Promise<StoreHistoryRecord> {
    return this.storeHistoryRecordService.create(storeHistoryRecord);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存历史记录信息' })
  @ApiResponse({ status: 200, description: '成功更新库存历史记录' })
  @ApiResponse({ status: 404, description: '库存历史记录未找到' })
  async update(
    @Param('id') id: string,
    @Body() storeHistoryRecord: StoreHistoryRecord,
  ): Promise<StoreHistoryRecord> {
    const updatedStoreHistoryRecord =
      await this.storeHistoryRecordService.update(+id, storeHistoryRecord);
    if (!updatedStoreHistoryRecord) {
      throw new NotFoundException(`StoreHistoryRecord with ID ${id} not found`);
    }
    return updatedStoreHistoryRecord;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存历史记录' })
  @ApiResponse({ status: 204, description: '成功删除库存历史记录' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeHistoryRecordService.remove(+id);
  }
}
