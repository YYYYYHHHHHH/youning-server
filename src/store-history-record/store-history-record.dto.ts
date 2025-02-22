import {
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChangeType } from './store-history-record.enum';

export class CreateStoreHistoryRecordDto {
  @ApiProperty({
    description: '变动时间',
    required: true,
    example: new Date(),
  })
  @IsNotEmpty({ message: '变动时间不能为空' })
  @IsDate({ message: '变动时间必须是日期类型' })
  @Type(() => Date)
  time!: Date;

  @ApiProperty({
    description: '仓库ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '仓库ID不能为空' })
  @IsNumber({}, { message: '仓库ID必须是数字' })
  storeId!: number;

  @ApiProperty({
    description: '操作人ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '操作人ID不能为空' })
  @IsNumber({}, { message: '操作人ID必须是数字' })
  personId!: number;

  @ApiProperty({
    description: '变动类型：1-调拨入库，2-调拨出库，3-采购入库，4-消耗出库',
    required: true,
    enum: ChangeType,
    example: ChangeType.PURCHASE_IN,
  })
  @IsNotEmpty({ message: '变动类型不能为空' })
  @IsEnum(ChangeType, { message: '无效的变动类型' })
  changeType!: ChangeType;

  @ApiProperty({
    description: '调出仓库ID（调拨类型必填）',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: '调出仓库ID必须是数字' })
  fromStoreId?: number;

  @ApiProperty({
    description: '调入仓库ID（调拨类型必填）',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: '调入仓库ID必须是数字' })
  toStoreId?: number;

  @ApiProperty({
    description: '材料ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsNumber({}, { message: '材料ID必须是数字' })
  materialId!: number;

  @ApiProperty({
    description: '变动数量',
    required: true,
    example: 100.5,
    minimum: 0,
  })
  @IsNotEmpty({ message: '变动数量不能为空' })
  @IsNumber({}, { message: '变动数量必须是数字' })
  @Min(0, { message: '变动数量不能小于0' })
  count!: number;
}
