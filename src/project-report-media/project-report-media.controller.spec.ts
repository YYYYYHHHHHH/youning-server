import { Test, TestingModule } from '@nestjs/testing';
import { ProjectReportMediaController } from './project-report-media.controller';
import { ProjectReportMediaService } from './project-report-media.service';
import { CreateProjectReportMediaDto } from './project-report-media.dto';
import { NotFoundException } from '@nestjs/common';

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
            create: jest.fn().mockResolvedValue(mockProjectReportMedia),
            remove: jest.fn().mockResolvedValue(undefined),
            findByDateAndProjectAndCreator: jest
              .fn()
              .mockResolvedValue([mockProjectReportMedia]),
            findByProject: jest
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

  describe('findByProject', () => {
    const mockQuery = { projectId: 1 };

    it('should return all project report medias', async () => {
      const result = await controller.findByProject(mockQuery);
      expect(result).toEqual([mockProjectReportMedia]);
      expect(service.findByProject).toHaveBeenCalledWith(
        mockQuery.projectId
      );
    });

    it('should throw NotFoundException when no medias found', async () => {
      jest.spyOn(service, 'findByProject').mockResolvedValue([]);
      await expect(
        controller.findByProject(mockQuery),
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
