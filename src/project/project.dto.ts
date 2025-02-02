import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ description: '项目名称', example: '测试项目' })
  @IsString({ message: '项目名称必须是字符串' })
  @Length(1, 100, { message: '项目名称长度必须在1-100之间' })
  name: string;

  @ApiProperty({
    description: '项目地点',
    required: false,
    example: '北京市朝阳区',
  })
  @IsOptional()
  @IsString({ message: '项目地点必须是字符串' })
  @Length(0, 200, { message: '项目地点长度不能超过200' })
  location?: string;

  @ApiProperty({
    description: '开始时间',
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate({ message: '开始时间必须是有效的日期格式' })
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({
    description: '结束时间',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate({ message: '结束时间必须是有效的日期格式' })
  @Type(() => Date)
  endTime?: Date;

  @ApiProperty({
    description: '媒体ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '媒体ID不能为空' })
  @IsNumber({}, { message: '媒体ID必须是数字' })
  mediaId: number;

  @ApiProperty({
    description: '备注',
    required: false,
    example: '这是一个测试项目的备注',
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  @Length(0, 500, { message: '备注长度不能超过500' })
  remark?: string;

  @ApiProperty({
    description: '负责人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '负责人ID不能为空' })
  @IsNumber({}, { message: '负责人ID必须是数字' })
  managerId: number;

  @ApiProperty({
    description: '创建人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  @IsNumber({}, { message: '创建人ID必须是数字' })
  createById: number;

  @ApiProperty({
    description: '创建时间',
    required: true,
    example: '2023-01-01T00:00:00Z',
  })
  @IsDate({ message: '创建时间必须是有效的日期格式' })
  @Type(() => Date)
  createTime: Date;
}
