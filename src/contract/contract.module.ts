import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './contract.entity';
import { SalesProject } from '../sales-project/sales-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, SalesProject])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}