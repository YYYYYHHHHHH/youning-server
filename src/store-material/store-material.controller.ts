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
  @ApiOperation({ summary: '获取所有仓库材料情况' })
  @ApiResponse({ status: 200, description: '成功获取仓库材料列表' })
  findAll(): Promise<StoreMaterial[]> {
    return this.storeMaterialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取仓库材料情况' })
  @ApiResponse({ status: 200, description: '成功获取仓库材料' })
  @ApiResponse({ status: 404, description: '仓库材料未找到' })
  async findOne(@Param('id') id: string): Promise<StoreMaterial> {
    const storeMaterial = await this.storeMaterialService.findOne(+id);
    if (!storeMaterial) {
      throw new NotFoundException(`StoreMaterial with ID ${id} not found`);
    }
    return storeMaterial;
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '根据仓库ID获取库存材料' })
  @ApiResponse({ status: 200, description: '成功获取仓库材料列表' })
  @ApiResponse({ status: 404, description: '仓库未找到或暂无库存' })
  async findByStoreId(@Param('storeId') storeId: string): Promise<StoreMaterial[]> {
    const storeMaterials = await this.storeMaterialService.findByStoreId(+storeId);
    if (!storeMaterials || storeMaterials.length === 0) {
      throw new NotFoundException(`No materials found in store with ID ${storeId}`);
    }
    return storeMaterials;
  }

  @Post()
  @ApiOperation({
    summary: '创建仓库材料',
    description: '在指定仓库中创建新的材料库存记录。注意：同一个仓库不能创建重复的材料记录。'
  })
  @ApiResponse({
    status: 201,
    description: '成功创建仓库材料记录。'
  })
  @ApiResponse({
    status: 400,
    description: '请求参数验证失败，可能是因为该仓库已存在相同材料的记录。'
  })
  create(
    @Body() storeMaterial: CreateStoreMaterialDto,
  ): Promise<StoreMaterial> {
    return this.storeMaterialService.create(storeMaterial);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库材料信息' })
  @ApiResponse({ status: 200, description: '成功更新仓库材料' })
  @ApiResponse({ status: 404, description: '仓库材料未找到' })
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
  @ApiOperation({ summary: '删除仓库材料信息' })
  @ApiResponse({ status: 204, description: '成功删除仓库材料信息' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeMaterialService.remove(+id);
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: '根据项目ID获取库存材料',
    description: '通过项目ID获取对应仓库的所有材料库存信息，因为一个项目通常对应一个仓库。'
  })
  @ApiResponse({
    status: 200,
    description: '成功获取项目关联仓库的材料库存列表'
  })
  @ApiResponse({
    status: 404,
    description: '未找到项目对应的仓库，或仓库中暂无材料库存'
  })
  async findByProjectId(@Param('projectId') projectId: string): Promise<StoreMaterial[]> {
    const storeMaterials = await this.storeMaterialService.findByProjectId(+projectId);
    if (!storeMaterials || storeMaterials.length === 0) {
      throw new NotFoundException(`No materials found for project with ID ${projectId}`);
    }
    return storeMaterials;
  }
}
