import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Auth(AuthType.None)
  @Get('produit/:produitId')
  findByProduit(@Param('produitId') produitId: number) {
    return this.reviewsService.findByProduit(+produitId);
  }

  @Auth(AuthType.None)
  @Get('seller/:sellerId')
  findBySeller(@Param('sellerId') sellerId: number) {
    return this.reviewsService.findBySeller(+sellerId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.reviewsService.remove(+id);
  }
}
