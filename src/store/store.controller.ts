import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { Store } from './store.entity';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: '获取所有商店' })
  @ApiResponse({ status: 200, description: '成功获取商店列表' })
  findAll(): Promise<Store[]> {
    return this.storeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取商店' })
  @ApiResponse({ status: 200, description: '成功获取商店' })
  @ApiResponse({ status: 404, description: '商店未找到' })
  async findOne(@Param('id') id: string): Promise<Store> {
    const store = await this.storeService.findOne(+id);
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  @Post()
  @ApiOperation({ summary: '创建商店' })
  @ApiResponse({ status: 201, description: '成功创建商店' })
  create(@Body() store: Store): Promise<Store> {
    return this.storeService.create(store);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商店信息' })
  @ApiResponse({ status: 200, description: '成功更新商店' })
  @ApiResponse({ status: 404, description: '商店未找到' })
  async update(@Param('id') id: string, @Body() store: Store): Promise<Store> {
    const updatedStore = await this.storeService.update(+id, store);
    if (!updatedStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return updatedStore;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商店' })
  @ApiResponse({ status: 204, description: '成功删除商店' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeService.remove(+id);
  }
} 