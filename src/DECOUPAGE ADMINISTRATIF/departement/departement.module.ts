import { Module } from '@nestjs/common';
import { DepartementService } from './departement.service';
import { DepartementController } from './departement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from './entities/departement.entity';
import { Region } from '../region/entities/region.entity';
import { Commune } from '../commune/entities/commune.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departement, Region])],
  controllers: [DepartementController],
  providers: [DepartementService],
})
export class DepartementModule {}
