import { Test, TestingModule } from '@nestjs/testing';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { CreatePersonDto } from './person.dto';
import { LoginDto } from './login.dto';
import { Authority } from './person.enum';
import { NotFoundException } from '@nestjs/common';

describe('PersonController', () => {
  let controller: PersonController;
  let service: PersonService;

  const mockPerson = {
    id: 1,
    name: '张三',
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
      controllers: [PersonController],
      providers: [
        {
          provide: PersonService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockPerson]),
            findOne: jest.fn().mockResolvedValue(mockPerson),
            create: jest.fn().mockResolvedValue(mockPerson),
            update: jest.fn().mockResolvedValue(mockPerson),
            remove: jest.fn().mockResolvedValue(undefined),
            login: jest.fn().mockResolvedValue(mockPerson),
          },
        },
      ],
    }).compile();

    controller = module.get<PersonController>(PersonController);
    service = module.get<PersonService>(PersonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of persons', async () => {
      expect(await controller.findAll()).toEqual([mockPerson]);
    });
  });

  describe('findOne', () => {
    it('should return a person', async () => {
      expect(await controller.findOne('1')).toEqual(mockPerson);
    });

    it('should throw NotFoundException when person not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a person', async () => {
      expect(await controller.create(mockCreatePersonDto)).toEqual(mockPerson);
    });
  });

  describe('login', () => {
    it('should return person info when login successful', async () => {
      expect(await controller.login(mockLoginDto)).toEqual(mockPerson);
    });
  });

  describe('update', () => {
    it('should update a person', async () => {
      expect(await controller.update('1', mockCreatePersonDto)).toEqual(
        mockPerson,
      );
    });

    it('should throw NotFoundException when person not found', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(null);
      await expect(controller.update('1', mockCreatePersonDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a person', async () => {
      expect(await controller.remove('1')).toBeUndefined();
    });
  });
});
