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
    this.ftpClient = new ftp.Client();
    this.ftpClient.ftp.verbose = true; // 启用详细日志
    this.connectToFtp();
  }

  private async connectToFtp() {
    try {
      await this.ftpClient.access({
        host: '192.168.11.100',
        user: 'image-server',
        password: 'Asd1234567',
        secure: false, // 如果使用 FTPS，请设置为 true
      });
      console.log('Connected to FTP server.');
    } catch (error) {
      console.error('Failed to connect to FTP server:', error);
    }
  }

  private async ensureFtpConnection() {
    if (!this.ftpClient.closed) {
      return;
    }
    console.log('Reconnecting to FTP server...');
    await this.connectToFtp();
  }

  async onModuleDestroy() {
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
    await this.ensureFtpConnection(); // 确保连接有效

    const media = new Media();
    media.mediaType = file.mimetype;
    media.originalName = file.originalname;
    media.createTime = new Date();

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}_${random}_${file.originalname}`;

    const directoryPath = '/home/';

    try {
      await this.ftpClient.ensureDir(directoryPath);

      const fileStream = new Readable();
      fileStream._read = () => {};
      fileStream.push(file.buffer);
      fileStream.push(null);

      await this.ftpClient.uploadFrom(
        fileStream,
        `${directoryPath}${filename}`,
      );
      console.log(`File ${filename} uploaded to FTP server.`);
    } catch (error) {
      console.error('Error uploading file to FTP server:', error);
      throw new Error('Failed to upload file to FTP server');
    }

    media.uri = `${directoryPath}${filename}`;

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
