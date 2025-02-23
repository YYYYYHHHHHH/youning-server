import { Test, TestingModule } from '@nestjs/testing';
import { ProjectReportMediaController } from './project-report-media.controller';
import { ProjectReportMediaService } from './project-report-media.service';
import { CreateProjectReportMediaDto } from './project-report-media.dto';
import { NotFoundException, HttpStatus } from '@nestjs/common';
import { BusinessException } from '../common/exceptions/business.exception';

describe('ProjectReportMediaController', () => {
  let controller: ProjectReportMediaController;
  let service: ProjectReportMediaService;

  const mockProjectReportMedia = {
    id: 1,
    projectReport: {
      id: 1,
      project: { id: 1, name: '测试项目' },
      createBy: { id: 1, name: '张三' },
      createTime: new Date('2024-02-23'),
      remark: '测试备注',
    },
    media: { id: 1, uri: 'http://example.com/image.jpg' },
  };

  const mockCreateProjectReportMediaDto: CreateProjectReportMediaDto = {
    projectId: 1,
    createById: 1,
    mediaId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectReportMediaController],
      providers: [
        {
          provide: ProjectReportMediaService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockProjectReportMedia]),
            findOne: jest.fn().mockResolvedValue(mockProjectReportMedia),
            create: jest.fn().mockResolvedValue(mockProjectReportMedia),
            update: jest.fn().mockResolvedValue(mockProjectReportMedia),
            remove: jest.fn().mockResolvedValue(undefined),
            findByDateAndProjectAndCreator: jest
              .fn()
              .mockResolvedValue([mockProjectReportMedia]),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectReportMediaController>(
      ProjectReportMediaController,
    );
    service = module.get<ProjectReportMediaService>(ProjectReportMediaService);

    // 重置所有 mock
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of project report medias', async () => {
      expect(await controller.findAll()).toEqual([mockProjectReportMedia]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project report media', async () => {
      expect(await controller.findOne('1')).toEqual(mockProjectReportMedia);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when project report media not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);
      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a project report media', async () => {
      expect(await controller.create(mockCreateProjectReportMediaDto)).toEqual(
        mockProjectReportMedia,
      );
      expect(service.create).toHaveBeenCalledWith(
        mockCreateProjectReportMediaDto,
      );
    });
  });

  describe('update', () => {
    it('should update a project report media', async () => {
      expect(
        await controller.update('1', mockCreateProjectReportMediaDto),
      ).toEqual(mockProjectReportMedia);
      expect(service.update).toHaveBeenCalledWith(
        1,
        mockCreateProjectReportMediaDto,
      );
    });

    it('should throw NotFoundException when project report media not found', async () => {
      jest.spyOn(service, 'update').mockRejectedValue(
        new BusinessException(
          `ProjectReportMedia with ID 1 not found`,
          HttpStatus.NOT_FOUND,
        ),
      );
      
      await expect(
        controller.update('1', mockCreateProjectReportMediaDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findTodayByProjectAndCreator', () => {
    const mockQuery = { projectId: 1, createById: 1 };

    it('should return today project report medias', async () => {
      const result = await controller.findTodayByProjectAndCreator(mockQuery);
      expect(result).toEqual([mockProjectReportMedia]);
      expect(service.findByDateAndProjectAndCreator).toHaveBeenCalledWith(
        expect.any(Date),
        mockQuery.projectId,
        mockQuery.createById,
      );
    });

    it('should throw NotFoundException when no medias found', async () => {
      jest
        .spyOn(service, 'findByDateAndProjectAndCreator')
        .mockResolvedValue([]);
      await expect(
        controller.findTodayByProjectAndCreator(mockQuery),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a project report media', async () => {
      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
