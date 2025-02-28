import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WorkDays } from './project-report-person.enum';

export class CreateProjectReportPersonDto {
  @ApiProperty({
    description: '项目报告ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '项目报告ID不能为空' })
  @IsNumber({}, { message: '项目报告ID必须是数字' })
  projectReportId!: number;

  @ApiProperty({
    description: '施工人员ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '施工人员ID不能为空' })
  @IsNumber({}, { message: '施工人员ID必须是数字' })
  personId!: number;

  @ApiProperty({
    description: '工作天数（只能是0、0.5或1）',
    required: true,
    example: WorkDays.ZERO,
    enum: WorkDays,
  })
  @IsNotEmpty({ message: '工作天数不能为空' })
  @IsEnum(WorkDays, { message: '工作天数只能是0、0.5或1' })
  workDays!: WorkDays;

  @ApiProperty({
    description: '额外加班小时数（0-8的整数）',
    required: true,
    example: 2,
    minimum: 0,
    maximum: 8,
  })
  @IsNotEmpty({ message: '加班小时数不能为空' })
  @IsInt({ message: '加班小时数必须是整数' })
  @Min(0, { message: '加班小时数不能小于0' })
  @Max(8, { message: '加班小时数不能超过8' })
  extraHours!: number;
}
