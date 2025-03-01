import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StoreHistoryRecord } from './store-history-record.entity';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';
import { Material } from '../material/material.entity';
import { CreateStoreHistoryRecordDto } from './store-history-record.dto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ChangeType } from './store-history-record.enum';

@Injectable()
export class StoreHistoryRecordService {
  constructor(
    @InjectRepository(StoreHistoryRecord)
    private storeHistoryRecordRepository: Repository<StoreHistoryRecord>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(Person)
    private personRepository: Repository<Person>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  findAll(): Promise<StoreHistoryRecord[]> {
    return this.storeHistoryRecordRepository.find({
      relations: ['store', 'person', 'fromStore', 'toStore', 'material'],
    });
  }

  findOne(id: number): Promise<StoreHistoryRecord | null> {
    return this.storeHistoryRecordRepository.findOne({
      where: { id },
      relations: ['store', 'person', 'fromStore', 'toStore', 'material'],
    });
  }

  findByStoreId(storeId: number): Promise<StoreHistoryRecord[]> {
    return this.storeHistoryRecordRepository.find({
      where: { store: { id: storeId } },
      relations: ['store', 'person', 'fromStore', 'toStore', 'material'],
      //按照该条记录的时间降序排序，确保最新的记录显示在前
      order: { time: 'DESC' }
    });
  }

  async findByProjectId(projectId: number): Promise<StoreHistoryRecord[]> {
    // 先通过项目ID查找关联的仓库
    const stores = await this.storeRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });

    if (!stores || stores.length === 0) {
      throw new BusinessException(
        `No stores found for Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 获取所有仓库ID
    const storeIds = stores.map(store => store.id);

    // 查询这些仓库的所有变动记录
    const historyRecords = await this.storeHistoryRecordRepository.find({
      where: { store: { id: In(storeIds) } },
      relations: ['store', 'person', 'fromStore', 'toStore', 'material'],
      order: { time: 'DESC' }, // 按时间降序排序
    });

    if (!historyRecords || historyRecords.length === 0) {
      throw new BusinessException(
        `No history records found for stores in Project ID ${projectId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    return historyRecords;
  }

  async create(
    createDto: CreateStoreHistoryRecordDto,
  ): Promise<StoreHistoryRecord> {
    const record = new StoreHistoryRecord();

    // 验证并设置基本信息
    const store = await this.storeRepository.findOneBy({
      id: createDto.storeId,
    });
    if (!store) {
      throw new BusinessException(
        `Store with ID ${createDto.storeId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const person = await this.personRepository.findOneBy({
      id: createDto.personId,
    });
    if (!person) {
      throw new BusinessException(
        `Person with ID ${createDto.personId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const material = await this.materialRepository.findOneBy({
      id: createDto.materialId,
    });
    if (!material) {
      throw new BusinessException(
        `Material with ID ${createDto.materialId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // 根据变动类型验证调拨仓库
    if (
      createDto.changeType === ChangeType.TRANSFER_IN ||
      createDto.changeType === ChangeType.TRANSFER_OUT
    ) {
      if (!createDto.fromStoreId || !createDto.toStoreId) {
        throw new BusinessException(
          '调拨类型必须指定调出和调入仓库',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromStore = await this.storeRepository.findOneBy({
        id: createDto.fromStoreId,
      });
      if (!fromStore) {
        throw new BusinessException(
          `FromStore with ID ${createDto.fromStoreId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const toStore = await this.storeRepository.findOneBy({
        id: createDto.toStoreId,
      });
      if (!toStore) {
        throw new BusinessException(
          `ToStore with ID ${createDto.toStoreId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      record.fromStore = fromStore;
      record.toStore = toStore;
    }

    record.time = createDto.time;
    record.store = store;
    record.person = person;
    record.changeType = createDto.changeType;
    record.material = material;
    record.count = createDto.count;

    return this.storeHistoryRecordRepository.save(record);
  }

  async update(
    id: number,
    storeHistoryRecord: StoreHistoryRecord,
  ): Promise<StoreHistoryRecord | null> {
    await this.storeHistoryRecordRepository.update(id, storeHistoryRecord);
    return this.storeHistoryRecordRepository.findOne({
      where: { id },
      relations: ['store', 'person'],
    });
  }

  async remove(id: number): Promise<void> {
    await this.storeHistoryRecordRepository.delete(id);
  }
}
