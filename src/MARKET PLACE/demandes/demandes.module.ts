import { Module } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { DemandesController } from './demandes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demande } from './entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from '../produits/entities/produit.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { forwardRef } from '@nestjs/common';
import { EscrowModule } from 'src/escrow/escrow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demande, User, Produit]),
    NotificationsModule,
    forwardRef(() => EscrowModule),
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
  exports: [DemandesService],
})
export class DemandesModule {}
