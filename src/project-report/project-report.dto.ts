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
    description: '额外加班小时数（0-5的整数）',
    required: true,
    example: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  extraHours!: number;
}

export class ProjectReportMaterialItemDto {
  @ApiProperty({
    description: '材料ID（必须是仓库库存中存在的材料）',
    required: true,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty({ message: '材料ID不能为空' })
  materialId!: number;

  @ApiProperty({
    description: '消耗数量（支持小数，最多两位小数）',
    required: true,
    example: 10,
    type: 'number',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: '消耗数量必须是数字，且最多支持两位小数' }
  )
  @Min(0.01, { message: '消耗数量必须大于0' })
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

  @ApiProperty({
    description: '日报图片ID列表',
    type: [Number],
    required: false,
    example: [1, 2, 3],
  })
  @IsArray({ message: '图片ID列表必须是数组' })
  @IsNumber({}, { each: true, message: '图片ID必须是数字' })
  @IsOptional()
  mediaIds?: number[];
}
