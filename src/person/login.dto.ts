import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '手机号',
    example: '13800138000',
  })
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号必须是11位' })
  phone!: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  password!: string;
}
