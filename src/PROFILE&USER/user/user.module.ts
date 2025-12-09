import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { Profile } from '../profiles/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Produit, Demande, Profile])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
