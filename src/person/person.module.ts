import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './person.entity';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), forwardRef(() => MediaModule)],
  providers: [PersonService],
  controllers: [PersonController],
  exports: [TypeOrmModule],
})
export class PersonModule {}
