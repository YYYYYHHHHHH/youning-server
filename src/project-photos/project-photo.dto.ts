import { IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectPhotoDto {
  @ApiProperty({
    description: '销售项目ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '销售项目ID不能为空' })
  @IsNumber({}, { message: '销售项目ID必须是数字' })
  salesProjectId: number;

  @ApiProperty({
    description: '媒体文件ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '媒体文件ID不能为空' })
  @IsNumber({}, { message: '媒体文件ID必须是数字' })
  mediaId: number;
}

export class UpdateProjectPhotoDto {
  @ApiProperty({
    description: '记录ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '记录ID不能为空' })
  @IsNumber({}, { message: '记录ID必须是数字' })
  id: number;

  @ApiProperty({
    description: '销售项目ID',
    required: false,
    example: 1,
  })
  @IsNumber({}, { message: '销售项目ID必须是数字' })
  salesProjectId?: number;

  @ApiProperty({
    description: '媒体文件ID',
    required: false,
    example: 1,
  })
  @IsNumber({}, { message: '媒体文件ID必须是数字' })
  mediaId?: number;
}