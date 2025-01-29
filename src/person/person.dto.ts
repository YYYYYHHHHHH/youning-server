import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ description: '姓名', example: '张三' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString({ message: '姓名必须是字符串' })
  name!: string;

  @ApiProperty({ description: '电话号码', example: '13800138000' })
  @IsNotEmpty({ message: '电话号码不能为空' })
  @IsString({ message: '电话号码必须是字符串' })
  @Matches(/^[0-9]{10,15}$/, { message: '电话号码格式不正确' })
  tel!: string;

  @ApiProperty({ description: '身份证号', example: '110101199003071234' })
  @IsNotEmpty({ message: '身份证号不能为空' })
  @IsString({ message: '身份证号必须是字符串' })
  @Length(1, 50, { message: '身份证号长度不能超过50个字符' })
  @Matches(/^[0-9]{15,18}$/, { message: '身份证号格式不正确' })
  identityId!: string;

  @ApiPropertyOptional({
    description: '头像',
    example: 'http://example.com/icon.png',
  })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  icon?: string;

  @ApiPropertyOptional({ description: '权限', example: '带班工人' })
  @IsNotEmpty({ message: '权限不能为空' })
  @IsString({ message: '权限必须是字符串' })
  authority!: string;

  @ApiPropertyOptional({
    description: '创建时间',
    example: '2023-01-01T00:00:00Z',
  })
  @IsNotEmpty({ message: '创建时间不能为空' })
  createTime!: Date;

  @ApiPropertyOptional({ description: '创建人ID', example: 1 })
  @IsOptional()
  @IsNumber({}, { message: '创建人ID必须是数字' })
  createBy?: number;

  @ApiProperty({ description: '银行卡号', example: '6222020200001234567' })
  @IsNotEmpty({ message: '银行卡号不能为空' })
  @IsString({ message: '银行卡号必须是字符串' })
  @Length(1, 100, { message: '银行卡号长度不能超过100个字符' })
  bankCard!: string;
}
