import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { Material } from './material.entity';

@ApiTags('materials')
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiOperation({ summary: '获取所有材料' })
  @ApiResponse({ status: 200, description: '成功获取材料列表' })
  findAll(): Promise<Material[]> {
    return this.materialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取材料' })
  @ApiResponse({ status: 200, description: '成功获取材料' })
  @ApiResponse({ status: 404, description: '材料未找到' })
  async findOne(@Param('id') id: string): Promise<Material> {
    const material = await this.materialService.findOne(+id);
    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return material;
  }

  @Post()
  @ApiOperation({ summary: '创建材料' })
  @ApiResponse({ status: 201, description: '成功创建材料' })
  create(@Body() material: Material): Promise<Material> {
    return this.materialService.create(material);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新材料信息' })
  @ApiResponse({ status: 200, description: '成功更新材料' })
  @ApiResponse({ status: 404, description: '材料未找到' })
  async update(@Param('id') id: string, @Body() material: Material): Promise<Material> {
    const updatedMaterial = await this.materialService.update(+id, material);
    if (!updatedMaterial) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }
    return updatedMaterial;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除材料' })
  @ApiResponse({ status: 204, description: '成功删除材料' })
  remove(@Param('id') id: string): Promise<void> {
    return this.materialService.remove(+id);
  }
} 