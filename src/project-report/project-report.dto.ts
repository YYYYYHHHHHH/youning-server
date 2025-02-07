import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProjectReportDto {
  @ApiProperty({
    description: '项目ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '项目ID不能为空' })
  @IsNumber({}, { message: '项目ID必须是数字' })
  projectId!: number;

  @ApiProperty({
    description: '创建人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '创建人ID不能为空' })
  @IsNumber({}, { message: '创建人ID必须是数字' })
  createById!: number;

  @ApiProperty({
    description: '备注',
    required: false,
    example: '这是一个项目报告的备注',
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;

  @ApiProperty({
    description: '创建时间',
    required: true,
    example: new Date(),
  })
  @IsNotEmpty({ message: '创建时间不能为空' })
  @IsDate({ message: '创建时间必须是日期类型' })
  @Type(() => Date)
  createTime!: Date;
} 