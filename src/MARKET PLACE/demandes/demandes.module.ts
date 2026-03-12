import { Module } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { DemandesController } from './demandes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demande } from './entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from '../produits/entities/produit.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Demande, User, Produit]),
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
})
export class DemandesModule {}
