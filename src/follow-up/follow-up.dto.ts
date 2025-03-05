import { IsNotEmpty, IsString, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Progress } from './follow-up.enum';

export class CreateFollowUpDto {
  @ApiProperty({
    description: '销售项目ID',
    required: true,
    example: 1,
  })
  @IsNotEmpty({ message: '销售项目ID不能为空' })
  @IsInt()
  salesProjectId: number;

  @ApiProperty({
    description: '跟进进度',
    required: true,
    enum: Progress,
    example: Progress.VISIT,
  })
  @IsNotEmpty({ message: '跟进进度不能为空' })
  @IsEnum(Progress)
  progress: Progress;

  @ApiProperty({
    description: '跟进说明',
    required: true,
    example: '已与客户进行初步沟通',
  })
  @IsNotEmpty({ message: '跟进说明不能为空' })
  @IsString()
  remark: string;

  @ApiProperty({
    description: '跟进时间',
    required: true,
    example: '2024-01-01T10:00:00Z',
  })
  @IsNotEmpty({ message: '跟进时间不能为空' })
  @IsDateString()
  followUpTime: Date;
}

export class UpdateFollowUpDto extends CreateFollowUpDto {}