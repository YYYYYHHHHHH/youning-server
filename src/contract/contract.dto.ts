import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiProperty({
    description: '甲方名称',
    required: true,
    example: '张三',
  })
  @IsNotEmpty({ message: '甲方名称不能为空' })
  @IsString()
  partyAName: string;

  @ApiProperty({
    description: '甲方电话',
    required: true,
    example: '13800138000',
  })
  @IsNotEmpty({ message: '甲方电话不能为空' })
  @IsString()
  partyAPhone: string;

  @ApiProperty({
    description: '合同金额',
    required: true,
    example: 10000,
    minimum: 0,
  })
  @IsNotEmpty({ message: '合同金额不能为空' })
  @IsNumber()
  @Min(0, { message: '合同金额不能小于0' })
  contractAmount: number;

  @ApiProperty({
    description: '工期开始时间',
    required: true,
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: '工期开始时间不能为空' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    description: '工期结束时间',
    required: true,
    example: '2024-12-31',
  })
  @IsNotEmpty({ message: '工期结束时间不能为空' })
  @IsDateString()
  endDate: Date;

  @ApiProperty({
    description: '签约人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '签约人ID不能为空' })
  @IsNumber()
  signatoryId: number;

  @ApiProperty({
    description: '工程地点',
    required: true,
    example: '北京市朝阳区xx街道',
  })
  @IsNotEmpty({ message: '工程地点不能为空' })
  @IsString()
  constructionSite: string;

  @ApiProperty({
    description: '签约日期',
    required: true,
    example: '2024-01-01',
  })
  @IsNotEmpty({ message: '签约日期不能为空' })
  @IsDateString()
  signingTime: Date;

  @ApiProperty({
    description: '备注',
    required: false,
    example: '特殊要求：xxx',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: '销售项目ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '销售项目ID不能为空' })
  @IsNumber()
  salesProjectId: number;
}

export class UpdateContractDto extends CreateContractDto {}