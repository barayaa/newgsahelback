import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartographieController } from './cartographie.controller';
import { CartographieService } from './cartographie.service';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { MagasinProduit } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin_produit.entity';
import { Category } from 'src/MARKET PLACE/categories/entities/category.entity';
import { Region } from 'src/DECOUPAGE ADMINISTRATIF/region/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Produit, MagasinProduit, Category, Region])],
  controllers: [CartographieController],
  providers: [CartographieService],
})
export class CartographieModule {}
