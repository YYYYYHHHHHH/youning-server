import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowUpMedia } from './follow-up-media.entity';
import { CreateFollowUpMediaDto, UpdateFollowUpMediaDto } from './follow-up-media.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class FollowUpMediaService {
  constructor(
    @InjectRepository(FollowUpMedia)
    private followUpMediaRepository: Repository<FollowUpMedia>,
  ) {}

  async create(createFollowUpMediaDto: CreateFollowUpMediaDto): Promise<FollowUpMedia> {
    const { followUpId, mediaId } = createFollowUpMediaDto;
    const followUpMedia = new FollowUpMedia();
    followUpMedia.followUp = { id: followUpId } as any;
    followUpMedia.media = { id: mediaId } as any;
    return this.followUpMediaRepository.save(followUpMedia);
  }

  async findAll(): Promise<FollowUpMedia[]> {
    return this.followUpMediaRepository.find({
      relations: ['followUp', 'media'],
    });
  }

  async findByFollowUpId(followUpId: number): Promise<FollowUpMedia[]> {
    return this.followUpMediaRepository.find({
      where: { followUp: { id: followUpId } },
      relations: ['followUp', 'media'],
    });
  }

  async findOne(id: number): Promise<FollowUpMedia> {
    const followUpMedia = await this.followUpMediaRepository.findOne({
      where: { id },
      relations: ['followUp', 'media'],
    });
    
    if (!followUpMedia) {
      throw new BusinessException(
        `FollowUpMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    
    return followUpMedia;
  }

  async update(id: number, updateFollowUpMediaDto: UpdateFollowUpMediaDto): Promise<FollowUpMedia> {
    const followUpMedia = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查

    if (updateFollowUpMediaDto.followUpId) {
      followUpMedia.followUp = { id: updateFollowUpMediaDto.followUpId } as any;
    }

    if (updateFollowUpMediaDto.mediaId) {
      followUpMedia.media = { id: updateFollowUpMediaDto.mediaId } as any;
    }

    return this.followUpMediaRepository.save(followUpMedia);
  }

  async remove(id: number): Promise<void> {
    const followUpMedia = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查
    
    await this.followUpMediaRepository.remove(followUpMedia);
  }
}