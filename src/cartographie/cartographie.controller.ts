import { Controller, Get, Query } from '@nestjs/common';
import { CartographieService } from './cartographie.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';

@Auth(AuthType.None)
@Controller('cartographie')
export class CartographieController {
  constructor(private readonly cartographieService: CartographieService) {}

  @Get('categories')
  getCategories() {
    return this.cartographieService.getCategories();
  }

  @Get('annees')
  getAnnees() {
    return this.cartographieService.getAnnees();
  }

  @Get('production')
  getProduction(
    @Query('categorieId') categorieId?: string,
    @Query('annee') annee?: string,
  ) {
    return this.cartographieService.getProduction(
      categorieId ? +categorieId : undefined,
      annee ? +annee : undefined,
    );
  }

  @Get('stockage')
  getStockage(
    @Query('categorieId') categorieId?: string,
    @Query('annee') annee?: string,
  ) {
    return this.cartographieService.getStockage(
      categorieId ? +categorieId : undefined,
      annee ? +annee : undefined,
    );
  }

  @Get('resume')
  getResume() {
    return this.cartographieService.getResume();
  }
}
