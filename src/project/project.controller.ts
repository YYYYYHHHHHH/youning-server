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
  remove(@Param('id') id: string): Promise<void> {
    return this.projectService.remove(+id);
  }
}
