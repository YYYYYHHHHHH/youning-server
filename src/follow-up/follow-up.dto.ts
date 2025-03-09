import { IsNotEmpty, IsString, IsEnum, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Progress } from './follow-up.enum';

export class CreateFollowUpDto {
  @ApiProperty({
    description: '销售项目ID - 关联的销售项目唯一标识符',
    required: true,
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: '销售项目ID不能为空' })
  @IsInt()
  salesProjectId: number;

  @ApiProperty({
    description: '跟进人ID - 创建此跟进记录的人员ID',
    required: false,
    example: 1,
    type: Number,
  })
  @IsInt()
  createById?: number;

  @ApiProperty({
    description: '跟进进度状态 - 表示当前销售跟进的阶段',
    required: true,
    enum: Progress,
    enumName: 'Progress',
    example: 'VISIT',
    examples: {
      NEW: {
        value: 'NEW',
        description: '新建 - 初始状态'
      },
      VISIT: {
        value: 'VISIT',
        description: '拜访 - 已与客户进行拜访'
      },
      INTENTION: {
        value: 'INTENTION',
        description: '意向 - 客户表示有购买意向'
      },
      QUOTATION: {
        value: 'QUOTATION',
        description: '报价 - 已向客户提供报价'
      },
      DEAL: {
        value: 'DEAL',
        description: '成交 - 客户已确认购买'
      },
      SHELVE: {
        value: 'SHELVE',
        description: '搁置 - 暂时搁置的项目'
      },
      CANCEL: {
        value: 'CANCEL',
        description: '撤单 - 客户取消或终止'
      }
    }
  })
  @IsNotEmpty({ message: '跟进进度不能为空' })
  @IsEnum(Progress)
  progress: Progress;

  @ApiProperty({
    description: '跟进说明 - 详细描述本次跟进的内容、结果和后续计划',
    required: true,
    example: '已与客户王总进行初步沟通，客户对我司防水材料表示兴趣，约定下周二再次拜访并提供样品。',
    minLength: 1,
    maxLength: 255
  })
  @IsNotEmpty({ message: '跟进说明不能为空' })
  @IsString()
  remark: string;
}

export class UpdateFollowUpDto extends CreateFollowUpDto {}