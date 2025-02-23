import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectReportMediaService } from './project-report-media.service';
import { ProjectReportMedia } from './project-report-media.entity';
import { ProjectReport } from '../project-report/project-report.entity';
import { Media } from '../media/media.entity';
import { CreateProjectReportMediaDto } from './project-report-media.dto';
import { BusinessException } from '../common/exceptions/business.exception';

describe('ProjectReportMediaService', () => {
  let service: ProjectReportMediaService;
  let projectReportMediaRepository: Repository<ProjectReportMedia>;
  let projectReportRepository: Repository<ProjectReport>;
  let mediaRepository: Repository<Media>;

  const mockProjectReportMedia = {
    id: 1,
    projectReport: {
      id: 1,
      project: { id: 1 },
      createBy: { id: 1 },
      createTime: new Date('2024-02-23'),
    },
    media: { id: 1 },
  };

  const mockCreateProjectReportMediaDto: CreateProjectReportMediaDto = {
    projectId: 1,
    createById: 1,
    mediaId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectReportMediaService,
        {
          provide: getRepositoryToken(ProjectReportMedia),
          useValue: {
            find: jest.fn().mockResolvedValue([mockProjectReportMedia]),
            findOne: jest.fn().mockResolvedValue(mockProjectReportMedia),
            findOneBy: jest.fn().mockResolvedValue(mockProjectReportMedia),
            create: jest.fn().mockReturnValue(mockProjectReportMedia),
            save: jest.fn().mockResolvedValue(mockProjectReportMedia),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(ProjectReport),
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue(mockProjectReportMedia.projectReport),
            findOneBy: jest
              .fn()
              .mockResolvedValue(mockProjectReportMedia.projectReport),
            save: jest
              .fn()
              .mockResolvedValue(mockProjectReportMedia.projectReport),
          },
        },
        {
          provide: getRepositoryToken(Media),
          useValue: {
            findOneBy: jest
              .fn()
              .mockResolvedValue(mockProjectReportMedia.media),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectReportMediaService>(ProjectReportMediaService);
    projectReportMediaRepository = module.get<Repository<ProjectReportMedia>>(
      getRepositoryToken(ProjectReportMedia),
    );
    projectReportRepository = module.get<Repository<ProjectReport>>(
      getRepositoryToken(ProjectReport),
    );
    mediaRepository = module.get<Repository<Media>>(getRepositoryToken(Media));

    // 重置所有 mock
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByDateAndProjectAndCreator', () => {
    it('should find project report medias by date and project and creator', async () => {
      const date = new Date();
      const result = await service.findByDateAndProjectAndCreator(date, 1, 1);
      expect(result).toEqual([mockProjectReportMedia]);
      expect(projectReportMediaRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a project report media', async () => {
      const result = await service.create(mockCreateProjectReportMediaDto);
      expect(result).toEqual(mockProjectReportMedia);
      expect(projectReportMediaRepository.save).toHaveBeenCalled();
    });

    it('should throw error if media not found', async () => {
      jest.spyOn(mediaRepository, 'findOneBy').mockResolvedValue(null);
      await expect(
        service.create(mockCreateProjectReportMediaDto),
      ).rejects.toThrow(BusinessException);
    });
  });

  // ... 其他测试用例
});
