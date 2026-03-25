import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Produit])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
