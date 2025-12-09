import { Module } from '@nestjs/common';
import { UniteService } from './unite.service';
import { UniteController } from './unite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unites } from './entities/unite.entity';
import { Produit } from '../produits/entities/produit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unites, Produit])],
  controllers: [UniteController],
  providers: [UniteService],
})
export class UniteModule {}
