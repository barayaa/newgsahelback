import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorite } from './entities/favorite.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, User, Produit])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
