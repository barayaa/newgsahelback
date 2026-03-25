import { Controller, Get, Param, Query } from '@nestjs/common';
import { PriceHistoryService } from './price-history.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('price-history')
@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Auth(AuthType.None)
  @Get('produit/:id')
  findByProduit(@Param('id') id: number, @Query('limit') limit?: number) {
    return this.priceHistoryService.findByProduit(+id, limit ? +limit : 30);
  }

  @Auth(AuthType.None)
  @Get('produit/:id/monthly')
  getMonthly(@Param('id') id: number) {
    return this.priceHistoryService.getAveragePriceByMonth(+id);
  }
}
