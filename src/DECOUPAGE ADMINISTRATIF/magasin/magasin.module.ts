import { Module } from '@nestjs/common';
import { MagasinService } from './magasin.service';
import { MagasinController } from './magasin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Magasin } from './entities/magasin.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Localite } from '../localite/entities/localite.entity';
import { MagasinProduit } from './entities/magasin_produit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Magasin, Produit, Localite, MagasinProduit]),
  ],
  controllers: [MagasinController],
  providers: [MagasinService],
})
export class MagasinModule {}
