import { IsNotEmpty, IsString, IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesProjectDto {
  @ApiProperty({
    description: '项目名称',
    required: true,
    example: '某小区防水工程',
  })
  @IsNotEmpty({ message: '项目名称不能为空' })
  @IsString()
  projectName: string;

  @ApiProperty({
    description: '客户名称',
    required: true,
    example: '张三',
  })
  @IsNotEmpty({ message: '客户名称不能为空' })
  @IsString()
  customerName: string;

  @ApiProperty({
    description: '联系电话',
    required: true,
    example: '13800138000',
  })
  @IsNotEmpty({ message: '联系电话不能为空' })
  @IsString()
  contactNumber: string;

  @ApiProperty({
    description: '项目地址',
    required: true,
    example: '北京市朝阳区xx小区',
  })
  @IsNotEmpty({ message: '项目地址不能为空' })
  @IsString()
  site: string;

  @ApiProperty({
    description: '销售人员ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '销售人员ID不能为空' })
  @IsInt()
  salesmanId: number;

  @ApiProperty({
    description: '标志性图片ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '标志性图片ID不能为空' })
  @IsInt()
  mediaId: number;
}

export class UpdateSalesProjectDto extends CreateSalesProjectDto {
  @ApiProperty({
    description: '更新时间',
    required: false,
    example: '2024-01-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  updateTime?: Date;
}