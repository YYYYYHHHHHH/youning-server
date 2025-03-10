import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialModule } from './material/material.module';
import { PersonModule } from './person/person.module';
import { ProjectReportModule } from './project-report/project-report.module';
import { ProjectReportMediaModule } from './project-report-media/project-report-media.module';
import { ProjectReportPersonModule } from './project-report-person/project-report-person.module';
import { StoreModule } from './store/store.module';
import { StoreHistoryRecordModule } from './store-history-record/store-history-record.module';
import { StoreMaterialModule } from './store-material/store-material.module';
import { MediaModule } from './media/media.module';
import { ProjectModule } from './project/project.module';
import { ProjectMediaRelationModule } from './project-media-relation/project-media-relation.module';
import { ContractModule } from './contract/contract.module';
import { ContractMediaModule } from './contract-media/contract-media.module';
import { FollowUpModule } from './follow-up/follow-up.module';
import { FollowUpMediaModule } from './follow-up-media/follow-up-media.module';
import { ProjectPhotoModule } from './project-photos/project-photo.module';
import { SalesProjectModule } from './sales-project/sales-project.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '192.168.11.102',
      port: 3306,
      username: 'root',
      password: '000719',
      database: 'youning',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MaterialModule,
    PersonModule,
    ProjectReportModule,
    ProjectReportMediaModule,
    ProjectReportPersonModule,
    StoreModule,
    StoreHistoryRecordModule,
    StoreMaterialModule,
    MediaModule,
    ProjectModule,
    ProjectMediaRelationModule,
    ContractModule,
    ContractMediaModule,
    FollowUpModule,
    FollowUpMediaModule,
    ProjectPhotoModule,
    SalesProjectModule,
  ],
})
export class AppModule {}
