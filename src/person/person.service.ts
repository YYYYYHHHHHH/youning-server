import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { Media } from '../media/media.entity';
import { CreatePersonDto } from './person.dto';
import { LoginDto } from './login.dto';
import { UpdatePersonDto } from './update-person.dto';
import { BusinessException } from '../common/exceptions/business.exception';
// 导入bcrypt库，用于密码加密
// bcrypt是一个强大的密码哈希算法库，它会自动处理盐值的生成和存储
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async findAll(): Promise<Person[]> {
    // 查询所有用户信息，同时加载关联的头像信息
    const persons = await this.personRepository.find({ relations: ['icon'] });
    // 移除密码字段，提高安全性
    return persons.map(person => {
      // 使用对象解构：
      // 1. password: 提取password属性
      // 2. ...personWithoutPassword: 将剩余的所有属性收集到新对象中
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...personWithoutPassword } = person;
      return personWithoutPassword as Person;
    });
  }

  async findOne(id: number): Promise<Person | null> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });
    
    if (!person) {
      return null;
    }
    
    // 移除密码字段，提高安全性
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...personWithoutPassword } = person;
    return personWithoutPassword as Person;
  }

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = new Person();

    // 验证手机号是否已存在
    if (createPersonDto.phone) {
      const existingPerson = await this.personRepository.findOne({
        where: { phone: createPersonDto.phone },
      });
      if (existingPerson) {
        throw new BusinessException(
          '该手机号已被注册',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new BusinessException(
        '手机号不能为空',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 使用bcrypt加密密码
    // 1. 生成随机盐值，用于增加密码的安全性
    const salt = await bcrypt.genSalt();
    // 2. 使用盐值对密码进行哈希加密，生成加密后的密码
    // bcrypt.hash方法会将盐值和哈希后的密码组合在一起存储
    const hashedPassword = await bcrypt.hash(createPersonDto.password, salt);

    // 设置基本信息
    person.name = createPersonDto.name;
    person.password = hashedPassword;//使用加密以后的密码
    person.authority = createPersonDto.authority;
    person.phone = createPersonDto.phone;
    person.create_time = new Date(); // 自动设置创建时间
    person.createById = createPersonDto.createById; // 设置创建人ID
    person.idCard = createPersonDto.idCard; // 设置身份证号
    if (createPersonDto.bankCard) {
      person.bankCard = createPersonDto.bankCard; // 设置银行卡号（如果有）
    }

    // 设置头像
    if (createPersonDto.icon) {
      const media = await this.mediaRepository.findOneBy({
        id: createPersonDto.icon, // icon 字段关联到 Media 表的 id
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${createPersonDto.icon} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      person.icon = media;
    }

    // 添加身份证号和银行卡号
    if (createPersonDto.idCard) {
      person.idCard = createPersonDto.idCard;
    }
    if (createPersonDto.bankCard) {
      person.bankCard = createPersonDto.bankCard;
    }

    return this.personRepository.save(person);
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
  ): Promise<Person | null> {
    const person = await this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });
    
    if (!person) {
      throw new BusinessException(
        `Person with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 如果要更新手机号，检查新手机号是否已被其他用户使用
    if (updatePersonDto.phone && updatePersonDto.phone !== person.phone) {
      const existingPerson = await this.personRepository.findOne({
        where: { phone: updatePersonDto.phone },
      });
      if (existingPerson && existingPerson.id !== id) {
        throw new BusinessException(
          '该手机号已被其他用户使用',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // 从DTO中解构出密码，创建一个不包含密码的新对象
    const { password: newPassword, ...updatePersonDtoWithoutPassword } = updatePersonDto;

    // 使用不包含密码的对象更新person
    Object.assign(person, updatePersonDtoWithoutPassword);

    // 如果提供了新密码，则需要重新加密
    if (newPassword && newPassword !== person.password) {
      // 1. 生成新的随机盐值
      const salt = await bcrypt.genSalt();
      // 2. 使用新的盐值对新密码进行哈希加密
      person.password = await bcrypt.hash(newPassword, salt);
    }

    if (updatePersonDto.icon) {
      const media = await this.mediaRepository.findOneBy({
        id: updatePersonDto.icon,
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${updatePersonDto.icon} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      person.icon = media;
    }

    // 更新身份证号和银行卡号
    if (updatePersonDto.idCard !== undefined) {
      person.idCard = updatePersonDto.idCard;
    }
    if (updatePersonDto.bankCard !== undefined) {
      person.bankCard = updatePersonDto.bankCard;
    }

    await this.personRepository.save(person);
    const result = await this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });

    if (result) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...personWithoutPassword } = result;
      return personWithoutPassword as Person;
    }
    return null;
  }

  async remove(id: number): Promise<void> {
    const person = await this.personRepository.findOneBy({ id });
    if (!person) {
      throw new BusinessException(
        `Person with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.personRepository.delete(id);
  }

  async login(loginDto: LoginDto): Promise<Person> {
    // 使用手机号查找用户
    const person = await this.personRepository.findOne({
      where: { phone: loginDto.phone },
      relations: ['icon'],
    });

    if (!person) {
      throw new BusinessException('手机号或密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 验证用户输入的密码是否正确
    // bcrypt.compare方法会自动从数据库中的哈希值提取盐值，
    // 然后使用相同的盐值对用户输入的密码进行哈希，并比较结果
    const isPasswordValid = await bcrypt.compare(
      loginDto.password, // 用户输入的原始密码
      person.password,   // 数据库中存储的哈希密码
    );
    if (!isPasswordValid) {
      throw new BusinessException('手机号或密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 返回用户信息（不包含密码）
    const { password, ...result } = person;
    return result as Person;
  }
}
