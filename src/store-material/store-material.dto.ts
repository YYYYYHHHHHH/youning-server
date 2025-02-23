import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    required: true,
    example: 20.0,
    minimum: 0,
  })
  @IsNotEmpty({ message: '库存预警阈值不能为空' })
  @IsNumber({}, { message: '库存预警阈值必须是数字' })
  @Min(0, { message: '库存预警阈值不能小于0' })
  warningThreshold!: number;
}
