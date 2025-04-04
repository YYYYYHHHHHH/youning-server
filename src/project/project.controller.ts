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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { Project } from './project.entity';
import { CreateProjectDto } from './project.dto';
import { SalesProject } from '../sales-project/sales-project.entity';

@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: '获取所有项目' })
  @ApiResponse({ status: 200, description: '成功获取项目列表' })
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取项目' })
  @ApiResponse({ status: 200, description: '成功获取项目' })
  @ApiResponse({ status: 404, description: '项目未找到' })
  async findOne(@Param('id') id: string): Promise<Project> {
    const project = await this.projectService.findOne(+id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  @Post()
  @ApiOperation({ summary: '创建项目' })
  @ApiResponse({ status: 201, description: '成功创建项目' })
  @ApiBody({ type: CreateProjectDto })
  create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return this.projectService.create(createProjectDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新项目信息' })
  @ApiResponse({ status: 200, description: '成功更新项目' })
  @ApiResponse({ status: 404, description: '项目未找到' })
  @ApiBody({ type: CreateProjectDto })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: CreateProjectDto,
  ): Promise<Project> {
    console.log(updateProjectDto);
    const updatedProject = await this.projectService.update(
      +id,
      updateProjectDto,
    );
    if (!updatedProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return updatedProject;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  @ApiResponse({ status: 204, description: '成功删除项目' })
  @ApiResponse({ status: 404, description: '项目未找到' })
  @ApiResponse({ status: 400, description: '无法删除项目，该项目已有日报记录关联' })
  @ApiResponse({ status: 500, description: '删除失败，可能由于外键约束等原因' })
  async remove(@Param('id') id: string): Promise<void> {
    const project = await this.projectService.findOne(+id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.projectService.remove(+id);
  }

  @Get('pending/construction')
  @ApiOperation({ summary: '获取需要创建施工工地的销售项目' })
  @ApiResponse({ status: 200, description: '成功获取待创建施工工地的销售项目列表' })
  async findPendingConstructionProjects(): Promise<SalesProject[]> {
    return this.projectService.findPendingConstructionProjects();
  }
}
