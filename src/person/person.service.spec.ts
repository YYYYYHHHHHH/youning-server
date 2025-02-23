import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonService } from './person.service';
import { Person } from './person.entity';
import { Media } from '../media/media.entity';
import { CreatePersonDto } from './person.dto';
import { LoginDto } from './login.dto';
import { Authority } from './person.enum';
import { BusinessException } from '../common/exceptions/business.exception';
import * as bcrypt from 'bcrypt';

describe('PersonService', () => {
  let service: PersonService;
  let personRepository: Repository<Person>;
  let mediaRepository: Repository<Media>;

  const mockPerson = {
    id: 1,
    name: '张三',
    password: 'hashedPassword123',
    authority: Authority.WORKER,
    phone: '13800138000',
    remark: '测试备注',
    icon: { id: 1, url: 'http://example.com/icon.jpg' },
  };

  const mockCreatePersonDto: CreatePersonDto = {
    name: '张三',
    password: 'Password123',
    authority: Authority.WORKER,
    phone: '13800138000',
    remark: '测试备注',
    icon: 1,
  };

  const mockLoginDto: LoginDto = {
    phone: '13800138000',
    password: 'Password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            find: jest.fn().mockResolvedValue([mockPerson]),
            findOne: jest.fn().mockResolvedValue(mockPerson),
            create: jest.fn().mockReturnValue(mockPerson),
            save: jest.fn().mockResolvedValue(mockPerson),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(Media),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    mediaRepository = module.get<Repository<Media>>(getRepositoryToken(Media));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of persons', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPerson]);
      expect(personRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a person', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockPerson);
      expect(personRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['icon'],
      });
    });
  });

  describe('create', () => {
    it('should create a person', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt' as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(mockCreatePersonDto);
      expect(result).toEqual(mockPerson);
      expect(personRepository.save).toHaveBeenCalled();
    });

    it('should throw error if media not found', async () => {
      jest.spyOn(mediaRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.create(mockCreatePersonDto)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('login', () => {
    it('should return person info when login successful', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const result = await service.login(mockLoginDto);
      const { password, ...expectedResult } = mockPerson;
      expect(result).toEqual(expectedResult);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(personRepository, 'findOne').mockResolvedValue(null);
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        BusinessException,
      );
    });

    it('should throw error when password invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(service.login(mockLoginDto)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      const result = await service.update(1, mockCreatePersonDto);
      const { password, ...expectedResult } = mockPerson;
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if person not found', async () => {
      jest.spyOn(personRepository, 'findOne').mockResolvedValue(null);
      await expect(service.update(1, mockCreatePersonDto)).rejects.toThrow(
        BusinessException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a person', async () => {
      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(mockPerson);
      await service.remove(1);
      expect(personRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw error if person not found', async () => {
      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(BusinessException);
    });
  });
});
