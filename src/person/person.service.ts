import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { Media } from '../media/media.entity';
import { CreatePersonDto } from './person.dto';
import { LoginDto } from './login.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.personRepository.find({ relations: ['icon'] });
  }

  findOne(id: number): Promise<Person | null> {
    return this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });
  }

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = new Person();

    // 加密密码
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createPersonDto.password, salt);

    // 设置基本信息
    person.name = createPersonDto.name;
    person.password = hashedPassword;
    person.authority = createPersonDto.authority;
    person.phone = createPersonDto.phone;
    person.remark = createPersonDto.remark;

    // 设置头像
    if (createPersonDto.icon) {
      const media = await this.mediaRepository.findOneBy({
        id: createPersonDto.icon,
      });
      if (!media) {
        throw new BusinessException(
          `Media with ID ${createPersonDto.icon} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      person.icon = media;
    }

    return this.personRepository.save(person);
  }

  async update(
    id: number,
    updatePersonDto: CreatePersonDto,
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

    // 如果更新密码，需要重新加密
    if (updatePersonDto.password) {
      const salt = await bcrypt.genSalt();
      updatePersonDto.password = await bcrypt.hash(updatePersonDto.password, salt);
    }

    Object.assign(person, updatePersonDto);

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

    await this.personRepository.save(person);
    const result = await this.personRepository.findOne({
      where: { id },
      relations: ['icon'],
    });

    if (result) {
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

    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      person.password,
    );

    if (!isPasswordValid) {
      throw new BusinessException('手机号或密码错误', HttpStatus.UNAUTHORIZED);
    }

    // 返回用户信息（不包含密码）
    const { password, ...result } = person;
    return result as Person;
  }
}
