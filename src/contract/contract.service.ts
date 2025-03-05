import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { SalesProject } from '../sales-project/sales-project.entity';
import { CreateContractDto, UpdateContractDto } from './contract.dto';
import { BusinessException } from '../common/exceptions/business.exception';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(SalesProject)
    private salesProjectRepository: Repository<SalesProject>,
  ) {}

  async findAll(): Promise<Contract[]> {
    return this.contractRepository.find({
      relations: ['salesProject', 'contractMedias', 'contractMedias.media'],
      order: {
        signingTime: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['salesProject', 'contractMedias', 'contractMedias.media'],
    });

    if (!contract) {
      throw new BusinessException(
        `合同ID ${id} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    return contract;
  }

  async findBySalesProject(salesProjectId: number): Promise<Contract[]> {
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.contractRepository.find({
      where: { salesProject: { id: salesProjectId } },
      relations: ['salesProject', 'contractMedias', 'contractMedias.media'],
      order: {
        signingTime: 'DESC',
      },
    });
  }

  async create(createDto: CreateContractDto): Promise<Contract> {
    // 验证销售项目是否存在
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: createDto.salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${createDto.salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证工期开始时间不能晚于结束时间
    const startDate = new Date(createDto.startDate);
    const endDate = new Date(createDto.endDate);
    if (startDate > endDate) {
      throw new BusinessException(
        '工期开始时间不能晚于结束时间',
        HttpStatus.BAD_REQUEST,
      );
    }

    const contract = this.contractRepository.create({
      ...createDto,
      salesProject,
    });

    return this.contractRepository.save(contract);
  }

  async update(id: number, updateDto: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);

    // 验证销售项目是否存在
    const salesProject = await this.salesProjectRepository.findOne({
      where: { id: updateDto.salesProjectId },
    });

    if (!salesProject) {
      throw new BusinessException(
        `销售项目ID ${updateDto.salesProjectId} 不存在`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 验证工期开始时间不能晚于结束时间
    const startDate = new Date(updateDto.startDate);
    const endDate = new Date(updateDto.endDate);
    if (startDate > endDate) {
      throw new BusinessException(
        '工期开始时间不能晚于结束时间',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 更新实体
    Object.assign(contract, {
      ...updateDto,
      salesProject,
    });

    return this.contractRepository.save(contract);
  }

  async remove(id: number): Promise<void> {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
  }
}