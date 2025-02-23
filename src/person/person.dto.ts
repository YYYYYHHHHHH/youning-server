import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Authority } from './person.enum';

export class CreatePersonDto {
  @ApiProperty({
    description: '人员姓名',
    example: '张三',
  })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString({ message: '姓名必须是字符串' })
  @Length(2, 50, { message: '姓名长度必须在2-50之间' })
  name!: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 100, { message: '密码长度必须在6-100之间' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '密码必须包含大小写字母和数字',
  })
  password!: string;

  @ApiProperty({
    description: '权限',
    enum: Authority,
    example: Authority.WORKER,
  })
  @IsNotEmpty({ message: '权限不能为空' })
  @IsEnum(Authority, { message: '无效的权限类型' })
  authority!: Authority;

  @ApiProperty({
    description: '手机号',
    required: false,
    example: '13800138000',
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号必须是11位' })
  phone?: string;

  @ApiProperty({
    description: '头像ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  icon?: number;

  @ApiProperty({
    description: '备注',
    required: false,
    example: '这是一个备注',
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @Length(0, 500, { message: '备注长度不能超过500' })
  remark?: string;
}
