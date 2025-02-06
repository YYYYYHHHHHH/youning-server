import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMaterialDto {
  @ApiProperty({ description: '材料名称', example: '钢筋' })
  @IsNotEmpty({ message: '材料名称不能为空' })
  @IsString({ message: '材料名称必须是字符串' })
  name!: string;

  @ApiProperty({ description: '图标ID', example: 1 })
  @IsNumber({}, { message: '图标ID必须是数字' })
  iconId!: number;

  @ApiProperty({ description: '单位', example: '吨' })
  @IsNotEmpty({ message: '单位不能为空' })
  @IsString({ message: '单位必须是字符串' })
  unit!: string;

  @ApiProperty({ description: '创建时间', example: new Date() })
  @Type(() => Date)
  @IsDate({ message: '创建时间必须是日期类型' })
  createTime!: Date;

  @ApiProperty({ description: '创建人ID', example: 1 })
  @IsNumber({}, { message: '创建人ID必须是数字' })
  createById!: number;
}
