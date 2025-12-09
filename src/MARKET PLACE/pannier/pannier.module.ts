import { Module } from '@nestjs/common';
import { PannierService } from './pannier.service';
import { PannierController } from './pannier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pannier } from './entities/pannier.entity';
import { Produit } from '../produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pannier, Produit, User])],
  controllers: [PannierController],
  providers: [PannierService],
})
export class PannierModule {}
