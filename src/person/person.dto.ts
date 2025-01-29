import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({ description: '姓名' })
  @IsNotEmpty({ message: '姓名不能为空' })
  @IsString({ message: '姓名必须是字符串' })
  name!: string;

  @ApiProperty({ description: '电话号码' })
  @IsNotEmpty({ message: '电话号码不能为空' })
  @IsString({ message: '电话号码必须是字符串' })
  tel!: string;

  @ApiProperty({ description: '身份证号' })
  @IsNotEmpty({ message: '身份证号不能为空' })
  @IsString({ message: '身份证号必须是字符串' })
  identityId!: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString({ message: '头像必须是字符串' })
  icon?: string;

  @ApiPropertyOptional({ description: '权限' })
  @IsNotEmpty({ message: '权限不能为空' })
  @IsString({ message: '权限必须是字符串' })
  authority!: string;

  @ApiPropertyOptional({ description: '创建时间' })
  @IsNotEmpty({ message: '创建时间不能为空' })
  createTime!: Date;

  @ApiPropertyOptional({ description: '创建人ID' })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  @IsNumber({}, { message: '创建人ID必须是数字' })
  createBy!: number;
}
