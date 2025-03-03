import { IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建仓库材料库存信息
 * 注意：同一个仓库不能创建多条相同材料的库存信息，(storeId, materialId)组合必须唯一
 */
export class CreateStoreMaterialDto {
  @ApiProperty({
    description: '仓库ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '仓库ID不能为空' })
  @IsNumber({}, { message: '仓库ID必须是数字' })
  storeId!: number;

  @ApiProperty({
    description: '材料ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '材料ID不能为空' })
  @IsNumber({}, { message: '材料ID必须是数字' })
  materialId!: number;

  @ApiProperty({
    description: '当前库存量',
    required: true,
    example: 100.5,
    minimum: 0,
  })
  @IsNotEmpty({ message: '当前库存量不能为空' })
  @IsNumber({}, { message: '当前库存量必须是数字' })
  @Min(0, { message: '当前库存量不能小于0' })
  currentStock!: number;

  @ApiProperty({
    description: '库存预警阈值',
    required: false,
    example: 20.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '库存预警阈值必须是数字' })
  @Min(0, { message: '库存预警阈值不能小于0' })
  warningThreshold?: number;
}

/**
 * 更新仓库材料库存信息
 * 用于更新库存量和预警阈值
 */
export class UpdateStoreMaterialDto {
  @ApiProperty({
    description: '当前库存量',
    required: false,
    example: 100.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '当前库存量必须是数字' })
  @Min(0, { message: '当前库存量不能小于0' })
  currentStock?: number;

  @ApiProperty({
    description: '库存预警阈值',
    required: false,
    example: 20.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: '库存预警阈值必须是数字' })
  @Min(0, { message: '库存预警阈值不能小于0' })
  warningThreshold?: number;
}
