/**
 * 更新人员信息的数据传输对象
 * 
 * 该文件定义了用于更新人员信息的DTO（数据传输对象）。
 * 
 * 为什么不继承 CreatePersonDto：
 * 在 CreatePersonDto 中 password 是必填字段，而在 UpdatePersonDto 中是可选字段，
 * 导致类型不兼容。通过重新定义 UpdatePersonDto 类，不再继承 CreatePersonDto，
 * 而是单独定义所有需要的字段来解决这个问题。这样在更新用户信息时，
 * 可以只提供需要更新的字段，而不必提供所有字段。
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsEnum, IsNumberString, Matches } from 'class-validator';
import { Authority } from './person.enum';

export class UpdatePersonDto {
  @ApiProperty({
    description: '人员姓名',
    example: '张三',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @Length(2, 50, { message: '姓名长度必须在2-50之间' })
  name?: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 50, { message: '密码长度必须在6-50之间' })
  password?: string;
  
  @ApiProperty({
    description: '权限',
    example: 'ADMIN',
    enum: Authority,
    required: false,
  })
  @IsOptional()
  @IsEnum(Authority, { message: '权限值无效' })
  authority?: Authority;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Length(11, 11, { message: '手机号长度必须是11位' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiProperty({
    description: '身份证号',
    example: '110101199001011234',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '身份证号必须是字符串' })
  @Length(18, 18, { message: '身份证号长度必须是18位' })
  idCard?: string;

  @ApiProperty({
    description: '头像ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  icon?: number;

  @ApiProperty({
    description: '银行卡号',
    example: '6222021234567890123',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '银行卡号必须是字符串' })
  @Length(16, 19, { message: '银行卡号长度必须在16-19之间' })
  bankCard?: string;
  
  @ApiProperty({
    description: '创建人ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  createById?: number;
}