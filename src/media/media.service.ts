import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { Person } from '../person/person.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {}

  findAll(): Promise<Media[]> {
    return this.mediaRepository.find();
  }

  findOne(id: number): Promise<Media | null> {
    return this.mediaRepository.findOneBy({ id });
  }

  async create(file: any, creatorId: number): Promise<Media> {
    console.log(file);
    const media = new Media();
    media.mediaType = file.mimetype;
    media.originalName = file.originalname;
    media.createTime = new Date();

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}_${random}_${file.originalname}`;
    const uploadDir = '/tmp/tmp_images';
    const uploadPath = path.join(uploadDir, filename);

    // 检查目录是否存在，如果不存在则创建
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 将文件写入本地
    fs.writeFileSync(uploadPath, file.buffer);

    media.uri = `/uploads/${filename}`;

    // 设置创建人
    const creator = await this.personRepository.findOneBy({ id: creatorId });
    if (!creator) {
      throw new Error('Creator not found');
    }
    media.createBy = creator;

    return this.mediaRepository.save(media);
  }

  async update(id: number, media: Media): Promise<Media | null> {
    await this.mediaRepository.update(id, media);
    return this.mediaRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.mediaRepository.delete(id);
  }
}
