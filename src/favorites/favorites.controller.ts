import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';

export class ToggleFavoriteDto {
  @Type(() => Number)
  @IsNumber()
  userId: number;

  @Type(() => Number)
  @IsNumber()
  produitId: number;
}

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Auth(AuthType.Bearer)
  @Post('toggle')
  toggle(@Body() dto: ToggleFavoriteDto) {
    return this.favoritesService.toggle(dto.userId, dto.produitId);
  }

  @Auth(AuthType.Bearer)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.favoritesService.findByUser(+userId);
  }

  @Auth(AuthType.Bearer)
  @Get('user/:userId/ids')
  getUserFavoriteIds(@Param('userId') userId: number) {
    return this.favoritesService.getUserFavoriteIds(+userId);
  }

  @Auth(AuthType.Bearer)
  @Get('check/:userId/:produitId')
  isFavorite(@Param('userId') userId: number, @Param('produitId') produitId: number) {
    return this.favoritesService.isFavorite(+userId, +produitId);
  }
}
