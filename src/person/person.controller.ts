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
import { LoginDto } from './login.dto';

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
    examples: {
      example1: {
        summary: '更新人员信息示例',
        value: {
          name: '张三',
          password: 'password123',
          authority: '管理员', // 可选值：销售、工地负责人、工人、管理员
          phone: '13800138000',
          idCard: '110101199001011234',
          icon: 1,
          createById: 1,
          bankCard: '6222021234567890123' // 可选字段
        }
      }
    }
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

  @Post('login')
  @ApiOperation({
    summary: '用户登录',
    description: '用户登录接口，返回用户信息（不包含密码）',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功，返回用户信息',
  })
  @ApiResponse({
    status: 401,
    description: '登录失败，用户名或密码错误',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<Person> {
    return this.personService.login(loginDto);
  }
}
