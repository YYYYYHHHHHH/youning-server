import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { StoreHistoryRecord } from './store-history-record.entity';
import { Store } from '../store/store.entity';
import { Person } from '../person/person.entity';
import { Material } from '../material/material.entity';
import { StoreMaterial } from '../store-material/store-material.entity';
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
    @InjectRepository(StoreMaterial)
    private storeMaterialRepository: Repository<StoreMaterial>,
    private dataSource: DataSource,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const record = new StoreHistoryRecord();
      record.time = new Date();

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

      // 处理不同类型的动库记录
      switch (createDto.changeType) {
        case ChangeType.PURCHASE_IN:
          // 采购入库：检查并更新库存
          let storeMaterial = await this.storeMaterialRepository.findOne({
            where: {
              store: { id: store.id },
              material: { id: material.id },
            },
          });

          if (storeMaterial) {
            // 已有该材料，更新库存
            storeMaterial.currentStock = Number(storeMaterial.currentStock) + Number(createDto.count);
          } else {
            // 新材料，创建库存记录
            storeMaterial = new StoreMaterial();
            storeMaterial.store = store;
            storeMaterial.material = material;
            storeMaterial.currentStock = Number(createDto.count);
          }
          await queryRunner.manager.save(storeMaterial);
          break;
        
        //类型为调拨入库或调拨出库的操作
        case ChangeType.TRANSFER_OUT:
        case ChangeType.TRANSFER_IN:
          // 验证调拨仓库
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

          // 检查并更新调出仓库库存
          const fromStoreMaterial = await this.storeMaterialRepository.findOne({
            where: {
              store: { id: fromStore.id },
              material: { id: material.id },
            },
          });

          if (!fromStoreMaterial || fromStoreMaterial.currentStock < createDto.count) {
            throw new BusinessException(
              '调出仓库库存不足',
              HttpStatus.BAD_REQUEST,
            );
          }

          // 更新调出仓库库存
          fromStoreMaterial.currentStock -= createDto.count;
          await queryRunner.manager.save(fromStoreMaterial);

          // 检查并更新调入仓库库存
          let toStoreMaterial = await this.storeMaterialRepository.findOne({
            where: {
              store: { id: toStore.id },
              material: { id: material.id },
            },
          });

          if (toStoreMaterial) {
            toStoreMaterial.currentStock = Number(toStoreMaterial.currentStock) + Number(createDto.count);
          } else {
            toStoreMaterial = new StoreMaterial();
            toStoreMaterial.store = toStore;
            toStoreMaterial.material = material;
            toStoreMaterial.currentStock = Number(createDto.count);
          }
          await queryRunner.manager.save(toStoreMaterial);

          // 设置调拨记录的仓库信息
          record.fromStore = fromStore;
          record.toStore = toStore;
          break;

        case ChangeType.CONSUME_OUT:
          // 消耗出库：检查并更新库存
          const consumeStoreMaterial = await this.storeMaterialRepository.findOne({
            where: {
              store: { id: store.id },
              material: { id: material.id },
            },
          });

          if (!consumeStoreMaterial || consumeStoreMaterial.currentStock < createDto.count) {
            throw new BusinessException(
              '库存不足',
              HttpStatus.BAD_REQUEST,
            );
          }

          consumeStoreMaterial.currentStock -= createDto.count;
          await queryRunner.manager.save(consumeStoreMaterial);
          break;
      }

      // 设置记录基本信息
      record.store = store;
      record.person = person;
      record.changeType = createDto.changeType;
      record.material = material;
      record.count = createDto.count;

      // 保存调拨动库记录（本体）
      const savedRecord = await queryRunner.manager.save(record);

      // 如果是调拨出库类型，创建对应的入库记录
      if (createDto.changeType === ChangeType.TRANSFER_OUT) {
        // 创建一条调入记录，表示物料进入目标仓库
        const inRecord = new StoreHistoryRecord();
        inRecord.time = record.time;
        inRecord.store = record.toStore!;
        inRecord.person = record.person;
        inRecord.changeType = ChangeType.TRANSFER_IN;
        inRecord.material = record.material;
        inRecord.count = record.count;
        inRecord.fromStore = record.fromStore;
        inRecord.toStore = record.toStore;
        await queryRunner.manager.save(inRecord);// 保存入库记录
      }
      
      // 如果是调拨入库类型，创建对应的出库记录
      if (createDto.changeType === ChangeType.TRANSFER_IN) {
        const outRecord = new StoreHistoryRecord();
        outRecord.time = record.time;
        outRecord.store = record.fromStore!;
        outRecord.person = record.person;
        outRecord.changeType = ChangeType.TRANSFER_OUT;
        outRecord.material = record.material;
        outRecord.count = record.count;
        outRecord.fromStore = record.fromStore;
        outRecord.toStore = record.toStore;
        await queryRunner.manager.save(outRecord);
      }

      await queryRunner.commitTransaction();
      return savedRecord;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
