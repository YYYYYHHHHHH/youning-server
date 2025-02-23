import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsIn,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProjectReportPersonItemDto {
  @ApiProperty({
    description: '施工人员ID',
    required: true,
    example: 1,
  })
  @IsNumber()
  personId!: number;

  @ApiProperty({
    description: '工作天数（只能是0、0.5或1）',
    required: true,
    example: 1,
    enum: [0, 0.5, 1],
  })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 0.5, 1])
  workDays!: number;

  @ApiProperty({
    description: '额外加班小时数（0-8的整数）',
    required: true,
    example: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(8)
  extraHours!: number;
}

export class ProjectReportMaterialItemDto {
  @ApiProperty({
    description: '材料ID',
    required: true,
    example: 1,
  })
  @IsNumber()
  materialId!: number;

  @ApiProperty({
    description: '消耗数量（整数）',
    required: true,
    example: 10,
    type: 'integer',
  })
  @IsNumber({}, { message: '消耗数量必须是数字' })
  @IsInt({ message: '消耗数量必须是整数' })
  @Min(1, { message: '消耗数量必须大于0' })
  count!: number;
}

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
    example: '今日工作顺利',
  })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;

  @ApiProperty({
    description: '施工人员工时记录',
    type: [ProjectReportPersonItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectReportPersonItemDto)
  persons!: ProjectReportPersonItemDto[];

  @ApiProperty({
    description: '材料消耗记录',
    type: [ProjectReportMaterialItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectReportMaterialItemDto)
  materials!: ProjectReportMaterialItemDto[];
}
