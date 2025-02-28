import { IsString, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({
    description: '仓库名称',
    example: '主仓库',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: '仓库名称必须是字符串' })
  @Length(1, 100, { message: '仓库名称长度必须在1-100之间' })
  name!: string;

  @ApiProperty({
    description:
      '关联的项目ID（一个仓库只能关联一个项目，一个项目也只能关联一个仓库）',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: '项目ID必须是数字' })
  projectId?: number;

  @ApiProperty({
    description: '关联的媒体ID',
    required: false,
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: '媒体ID必须是数字' })
  mediaId?: number;
}
