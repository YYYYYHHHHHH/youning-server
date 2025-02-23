import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  Length,
  Matches,
  IsNumberString,
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
    example: '123456',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 50, { message: '密码长度必须在6-50之间' })
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
    required: true,
    example: '13800138000',
  })
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号必须是11位' })
  phone!: string;

  @ApiProperty({
    description: '头像ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  icon?: number;

  @ApiProperty({
    description: '创建人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  createById!: number;

  @ApiProperty({
    description: '身份证号',
    required: true,
    example: '110101199001011234',
  })
  @IsNotEmpty({ message: '身份证号不能为空' })
  @IsString({ message: '身份证号必须是字符串' })
  @Length(18, 18, { message: '身份证号必须是18位' })
  idCard!: string;

  @ApiProperty({
    description: '银行卡号',
    required: false,
    example: '6222021234567890123',
  })
  @IsOptional()
  @IsNumberString({}, { message: '银行卡号只能包含数字' })
  @Length(16, 19, { message: '银行卡号长度必须在16-19位之间' })
  bankCard?: string;
}
