import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectReportMediaDto {
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
    description: '媒体ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '媒体ID不能为空' })
  @IsNumber({}, { message: '媒体ID必须是数字' })
  mediaId!: number;
} 