import { Module } from '@nestjs/common';
import { LocaliteService } from './localite.service';
import { LocaliteController } from './localite.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localite } from './entities/localite.entity';
import { Commune } from '../commune/entities/commune.entity';
import { Marcher } from '../marcher/entities/marcher.entity';
import { Magasin } from '../magasin/entities/magasin.entity';
import { MagasinProduit } from '../magasin/entities/magasin_produit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Localite,
      Commune,
      Marcher,
      Magasin,
      MagasinProduit,
    ]),
  ],
  controllers: [LocaliteController],
  providers: [LocaliteService],
})
export class LocaliteModule {}
