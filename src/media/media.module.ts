import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    PersonModule,
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [TypeOrmModule],
})
export class MediaModule {} 