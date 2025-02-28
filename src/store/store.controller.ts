import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
  NotFoundException,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { Store } from './store.entity';
import { CreateStoreDto } from './store.dto';

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({
    summary: '获取所有仓库',
    description: '获取所有仓库的列表，包含每个仓库关联的项目信息。',
  })
  @ApiResponse({
    status: 200,
    description:
      '成功获取仓库列表。每个仓库对象都包含其关联的项目信息（如果有）。',
  })
  findAll(): Promise<Store[]> {
    return this.storeService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取仓库',
    description: '根据仓库ID获取单个仓库的详细信息，包含其关联的项目信息。',
  })
  @ApiResponse({
    status: 200,
    description: '成功获取仓库信息，包含关联的项目详情。',
  })
  @ApiResponse({ status: 404, description: '仓库未找到' })
  async findOne(@Param('id') id: string): Promise<Store> {
    const store = await this.storeService.findOne(+id);
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return store;
  }

  @Put(':id')
  @ApiOperation({
    summary: '更新仓库信息',
    description:
      '更新仓库信息，包括仓库名称和项目关联关系。注意：修改项目关联关系时需确保目标项目未被其他仓库关联。',
  })
  @ApiResponse({
    status: 200,
    description:
      '成功更新仓库信息。返回更新后的完整仓库信息，包含关联的项目详情。',
  })
  @ApiResponse({ status: 404, description: '仓库未找到或关联的项目未找到' })
  @ApiBody({ type: CreateStoreDto })
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: CreateStoreDto,
  ): Promise<Store> {
    const updatedStore = await this.storeService.update(+id, updateStoreDto);
    if (!updatedStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }
    return updatedStore;
  }

  @Post()
  @ApiOperation({
    summary: '创建仓库',
    description: '创建新的仓库，可以同时设置仓库名称和关联的项目。',
  })
  @ApiResponse({
    status: 201,
    description: '成功创建仓库。返回创建的仓库信息，包含关联的项目详情。',
  })
  @ApiBody({ type: CreateStoreDto })
  create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeService.create(createStoreDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  @ApiResponse({ status: 204, description: '成功删除仓库' })
  remove(@Param('id') id: string): Promise<void> {
    return this.storeService.remove(+id);
  }
}
