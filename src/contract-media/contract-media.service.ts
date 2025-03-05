import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractMedia } from './contract-media.entity';
import { CreateContractMediaDto, UpdateContractMediaDto } from './contract-media.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ContractMediaService {
  constructor(
    @InjectRepository(ContractMedia)
    private contractMediaRepository: Repository<ContractMedia>,
  ) {}

  async create(createContractMediaDto: CreateContractMediaDto): Promise<ContractMedia> {
    const { contractId, mediaId } = createContractMediaDto;
    const contractMedia = new ContractMedia();
    contractMedia.contract = { id: contractId } as any;
    contractMedia.media = { id: mediaId } as any;
    contractMedia.createTime = new Date();
    return this.contractMediaRepository.save(contractMedia);
  }

  async findAll(): Promise<ContractMedia[]> {
    return this.contractMediaRepository.find({
      relations: ['contract', 'media'],
    });
  }

  async findByContractId(contractId: number): Promise<ContractMedia[]> {
    return this.contractMediaRepository.find({
      where: { contract: { id: contractId } },
      relations: ['contract', 'media'],
    });
  }

  async findOne(id: number): Promise<ContractMedia> {
    const contractMedia = await this.contractMediaRepository.findOne({
      where: { id },
      relations: ['contract', 'media'],
    });

    if (!contractMedia) {
      throw new BusinessException(
        `ContractMedia with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return contractMedia;
  }

  async update(id: number, updateContractMediaDto: UpdateContractMediaDto): Promise<ContractMedia> {
    const contractMedia = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查

    if (updateContractMediaDto.contractId) {
      contractMedia.contract = { id: updateContractMediaDto.contractId } as any;
    }

    if (updateContractMediaDto.mediaId) {
      contractMedia.media = { id: updateContractMediaDto.mediaId } as any;
    }

    return this.contractMediaRepository.save(contractMedia);
  }

  async remove(id: number): Promise<void> {
    const contractMedia = await this.findOne(id);
    // findOne方法已经处理了不存在的情况，这里不需要再检查

    await this.contractMediaRepository.remove(contractMedia);
  }
}