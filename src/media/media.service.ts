import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { Person } from '../person/person.entity';
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';

@Injectable()
export class MediaService implements OnModuleDestroy {
  private ftpClient: ftp.Client;

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
  ) {
    // 初始化 FTP 客户端
    this.ftpClient = new ftp.Client();
    this.ftpClient.ftp.verbose = true; // 启用详细日志

    // 连接到 FTP 服务器
    this.ftpClient.access({
      host: '192.168.11.100',
      user: 'image-server',
      password: 'Asd1234567',
      secure: false, // 如果使用 FTPS，请设置为 true
    }).then(() => {
      console.log('Connected to FTP server.');
    }).catch(error => {
      console.error('Failed to connect to FTP server:', error);
    });
  }

  async onModuleDestroy() {
    // 关闭 FTP 连接
    await this.ftpClient.close();
    console.log('FTP connection closed.');
  }

  findAll(): Promise<Media[]> {
    return this.mediaRepository.find();
  }

  findOne(id: number): Promise<Media | null> {
    return this.mediaRepository.findOneBy({ id });
  }

  async create(file: any, creatorId: number): Promise<Media> {
    console.log('Uploading file to FTP server...');
    const media = new Media();
    media.mediaType = file.mimetype;
    media.originalName = file.originalname;
    media.createTime = new Date();

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}_${random}_${file.originalname}`;

    const directoryPath = '/home/';

    try {
      // 检查并创建 /uploads/ 目录
      await this.ftpClient.ensureDir(directoryPath);

      // 将文件缓冲区转换为可读流
      const fileStream = new Readable();
      fileStream._read = () => {}; // _read 是必须的，但可以是空函数
      fileStream.push(file.buffer);
      fileStream.push(null);

      // 上传文件到 FTP 服务器
      await this.ftpClient.uploadFrom(fileStream, `${directoryPath}${filename}`);
      console.log(`File ${filename} uploaded to FTP server.`);
    } catch (error) {
      console.error('Error uploading file to FTP server:', error);
      throw new Error('Failed to upload file to FTP server');
    }

    media.uri = `${directoryPath}${filename}`;

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
