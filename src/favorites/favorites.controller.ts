import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiTags } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ToggleFavoriteDto {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  produitId: number;
}

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  toggle(@Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(dto.userId, dto.produitId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.favoritesService.findByUser(+userId);
  }

  @Get('user/:userId/ids')
  getUserFavoriteIds(@Param('userId') userId: number) {
    return this.favoritesService.getUserFavoriteIds(+userId);
  }

  @Get('check/:userId/:produitId')
  isFavorite(@Param('userId') userId: number, @Param('produitId') produitId: number) {
    return this.favoritesService.isFavorite(+userId, +produitId);
  }
}
