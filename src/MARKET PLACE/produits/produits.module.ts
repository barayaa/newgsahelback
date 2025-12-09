import { Module } from '@nestjs/common';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produit } from './entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import { Category } from '../categories/entities/category.entity';
import { MagasinProduit } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin_produit.entity';
import { MailModule } from 'src/MAIL&NOTIF/mail.module';
import { Pannier } from '../pannier/entities/pannier.entity';
import { Unites } from '../unite/entities/unite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produit,
      User,
      Localite,
      Category,
      MagasinProduit,
      Pannier,
      Unites,
    ]),
    MailModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
})
export class ProduitsModule {}
