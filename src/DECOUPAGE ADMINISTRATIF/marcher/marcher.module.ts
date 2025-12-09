import { Module } from '@nestjs/common';
import { MarcherService } from './marcher.service';
import { MarcherController } from './marcher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marcher } from './entities/marcher.entity';
import { Localite } from '../localite/entities/localite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Marcher, Localite])],
  controllers: [MarcherController],
  providers: [MarcherService],
})
export class MarcherModule {}
