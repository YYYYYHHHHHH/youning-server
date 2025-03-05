import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractMedia } from './contract-media.entity';
import { ContractMediaService } from './contract-media.service';
import { ContractMediaController } from './contract-media.controller';
import { Contract } from '../contract/contract.entity';
import { Media } from '../media/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContractMedia, Contract, Media])],
  providers: [ContractMediaService],
  controllers: [ContractMediaController],
  exports: [ContractMediaService],
})
export class ContractMediaModule {}