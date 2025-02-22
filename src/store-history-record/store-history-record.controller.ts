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

@ApiTags('store-history-records')
@Controller('store-history-records')
export class StoreHistoryRecordController {
  constructor(
    private readonly storeHistoryRecordService: StoreHistoryRecordService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有商店历史记录' })
  @ApiResponse({ status: 200, description: '成功获取商店历史记录列表' })
  findAll(): Promise<StoreHistoryRecord[]> {
    return this.storeHistoryRecordService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取商店历史记录' })
  @ApiResponse({ status: 200, description: '成功获取商店历史记录' })
  @ApiResponse({ status: 404, description: '商店历史记录未找到' })
  async findOne(@Param('id') id: string): Promise<StoreHistoryRecord> {
    const storeHistoryRecord =
      await this.storeHistoryRecordService.findOne(+id);
    if (!storeHistoryRecord) {
      throw new NotFoundException(`StoreHistoryRecord with ID ${id} not found`);
    }
    return storeHistoryRecord;
  }

  @Post()
  @ApiOperation({ summary: '创建商店历史记录' })
  @ApiResponse({ status: 201, description: '成功创建商店历史记录' })
  create(
    @Body() storeHistoryRecord: StoreHistoryRecord,
  ): Promise<StoreHistoryRecord> {
    return this.storeHistoryRecordService.create(storeHistoryRecord);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商店历史记录信息' })
  @ApiResponse({ status: 200, description: '成功更新商店历史记录' })
  @ApiResponse({ status: 404, description: '商店历史记录未找到' })
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
  @ApiOperation({ summary: '删除商店历史记录' })
  @ApiResponse({ status: 204, description: '成功删除商店历史记录' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeHistoryRecordService.remove(+id);
  }
}
