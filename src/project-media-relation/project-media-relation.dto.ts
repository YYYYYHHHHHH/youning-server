import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectMediaRelationDto {
  @ApiProperty({ description: '项目ID', example: 1 })
  @IsNumber()
  projectId: number;

  @ApiProperty({ description: '媒体文件ID', example: 1 })
  @IsNumber()
  mediaId: number;
}