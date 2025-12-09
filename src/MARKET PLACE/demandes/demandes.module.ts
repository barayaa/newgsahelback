import { Module } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { DemandesController } from './demandes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Demande } from './entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from '../produits/entities/produit.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/MAIL&NOTIF/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Demande, User, Produit, AuthModule]),
    MailModule,
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
})
export class DemandesModule {}
