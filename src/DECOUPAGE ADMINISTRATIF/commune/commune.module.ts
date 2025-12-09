import { Module } from '@nestjs/common';
import { CommuneService } from './commune.service';
import { CommuneController } from './commune.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departement } from '../departement/entities/departement.entity';
import { Commune } from './entities/commune.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commune, Departement])],
  controllers: [CommuneController],
  providers: [CommuneService],
})
export class CommuneModule {}
