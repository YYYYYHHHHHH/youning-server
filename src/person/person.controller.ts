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
import { PersonService } from './person.service';
import { Person } from './person.entity';
import { CreatePersonDto } from './person.dto';

@ApiTags('persons')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get()
  @ApiOperation({ summary: '获取所有人员' })
  @ApiResponse({ status: 200, description: '成功获取人员列表' })
  findAll(): Promise<Person[]> {
    return this.personService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取人员' })
  @ApiResponse({ status: 200, description: '成功获取人员' })
  @ApiResponse({ status: 404, description: '人员未找到' })
  async findOne(@Param('id') id: string): Promise<Person> {
    const person = await this.personService.findOne(+id);
    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return person;
  }

  @Post()
  @ApiOperation({ summary: '创建人员' })
  @ApiResponse({ status: 201, description: '成功创建人员' })
  @ApiResponse({ status: 400, description: '请求参数验证失败' })
  create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
    return this.personService.create(createPersonDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新人员信息' })
  @ApiResponse({ status: 200, description: '成功更新人员' })
  @ApiResponse({ status: 404, description: '人员未找到' })
  @ApiBody({
    description: '更新人员请求示例',
  })
  async update(
    @Param('id') id: string,
    @Body() createPersonDto: CreatePersonDto,
  ): Promise<Person> {
    const updatedPerson = await this.personService.update(+id, createPersonDto);
    if (!updatedPerson) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
    return updatedPerson;
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除人员' })
  @ApiResponse({ status: 204, description: '成功删除人员' })
  remove(@Param('id') id: string): Promise<void> {
    return this.personService.remove(+id);
  }
}
