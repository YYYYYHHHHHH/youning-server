import { Injectable, HttpStatus, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { Person } from '../person/person.entity';
import * as ftp from 'basic-ftp';
import { Readable } from 'stream';
import { BusinessException } from '../common/exceptions/business.exception';

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

  //FTP 服务器的连接配置
  private async connectToFtp() {
    try {
      await this.ftpClient.access({
        host: '192.168.11.100',
        user: 'image-server',
        password: 'Asd1234567',
        secure: false, // 如果使用 FTPS，请设置为 true
      });
      console.log('Connected to FTP server.');
    } catch (error: any) {
      throw new BusinessException(
        'Failed to connect to FTP server: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
  //接收上传的文件,file 包含文件类型、文件原名、文件内容
  async create(file: any, createById: number): Promise<Media> {
    const creator = await this.personRepository.findOneBy({ id: createById });
    if (!creator) {
      throw new BusinessException(
        `Creator with ID ${createById} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    //确保 FTP 连接可用
    await this.ensureFtpConnection();

    //保存文件信息到数据库
    const media = new Media();
    media.mediaType = file.mimetype;//文件类型
    media.originalName = file.originalname;//文件原名
    media.createTime = new Date();//创建时间
    media.createBy = creator;//创建者

    //生成文件名（使用时间戳和随机数确保唯一性）
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000);
    const filename = `${timestamp}_${random}_${file.originalname}`;
    const directoryPath = '/home/';

   
    try {
      await this.ftpClient.ensureDir(directoryPath); //确保目标目录存在
      //创建文件流，将文件buffer转换为可读流
      const fileStream = new Readable();
      fileStream._read = () => {};//创建 Readable 流
      fileStream.push(file.buffer);//写入文件内容
      fileStream.push(null);//结束流（push(null)）

      //通过 FTP 上传到服务器
      await this.ftpClient.uploadFrom(
        fileStream,
        `${directoryPath}${filename}`,
      );//上传文件流到指定路径
      media.uri = `${directoryPath}${filename}`;//保存文件的URI到media对象
    } catch (error: any) {
      throw new BusinessException(
        'Failed to upload file to FTP server: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );//如果上传过程中出现错误，会抛出 BusinessException：
    }

    return this.mediaRepository.save(media);
  }

  async update(id: number, media: Media): Promise<Media | null> {
    const existingMedia = await this.mediaRepository.findOneBy({ id });
    if (!existingMedia) {
      throw new BusinessException(
        `Media with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.mediaRepository.update(id, media);
    return this.mediaRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) {
      throw new BusinessException(
        `Media with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.mediaRepository.delete(id);
  }
}
