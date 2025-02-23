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
import { StoreMaterialService } from './store-material.service';
import { StoreMaterial } from './store-material.entity';
import { CreateStoreMaterialDto } from './store-material.dto';

@ApiTags('store-materials')
@Controller('store-materials')
export class StoreMaterialController {
  constructor(private readonly storeMaterialService: StoreMaterialService) {}

  @Get()
  @ApiOperation({ summary: '获取所有商店材料' })
  @ApiResponse({ status: 200, description: '成功获取商店材料列表' })
  findAll(): Promise<StoreMaterial[]> {
    return this.storeMaterialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取商店材料' })
  @ApiResponse({ status: 200, description: '成功获取商店材料' })
  @ApiResponse({ status: 404, description: '商店材料未找到' })
  async findOne(@Param('id') id: string): Promise<StoreMaterial> {
    const storeMaterial = await this.storeMaterialService.findOne(+id);
    if (!storeMaterial) {
      throw new NotFoundException(`StoreMaterial with ID ${id} not found`);
    }
    return storeMaterial;
  }

  @Post()
  @ApiOperation({ summary: '创建商店材料' })
  @ApiResponse({ status: 201, description: '成功创建商店材料' })
  create(
    @Body() storeMaterial: CreateStoreMaterialDto,
  ): Promise<StoreMaterial> {
    return this.storeMaterialService.create(storeMaterial);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新商店材料信息' })
  @ApiResponse({ status: 200, description: '成功更新商店材料' })
  @ApiResponse({ status: 404, description: '商店材料未找到' })
  async update(
    @Param('id') id: string,
    @Body() storeMaterial: CreateStoreMaterialDto,
  ): Promise<StoreMaterial> {
    const updatedStoreMaterial = await this.storeMaterialService.update(
      +id,
      storeMaterial,
    );
    if (!updatedStoreMaterial) {
      throw new NotFoundException(`StoreMaterial with ID ${id} not found`);
    }
    return updatedStoreMaterial;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除商店材料' })
  @ApiResponse({ status: 204, description: '成功删除商店材料' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeMaterialService.remove(+id);
  }
}
