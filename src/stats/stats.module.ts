import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { Marcher } from 'src/DECOUPAGE ADMINISTRATIF/marcher/entities/marcher.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Produit, Demande, Marcher, Localite]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
