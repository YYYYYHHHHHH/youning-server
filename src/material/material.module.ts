import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { MediaModule } from '../media/media.module';
import { PersonModule } from '../person/person.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    forwardRef(() => MediaModule),
    forwardRef(() => PersonModule),
  ],
  providers: [MaterialService],
  controllers: [MaterialController],
  exports: [TypeOrmModule],
})
export class MaterialModule {}
