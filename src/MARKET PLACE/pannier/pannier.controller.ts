import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PannierService } from './pannier.service';
import { CreatePannierDto } from './dto/create-pannier.dto';
import { UpdatePannierDto } from './dto/update-pannier.dto';

@Controller('pannier')
export class PannierController {
  constructor(private readonly pannierService: PannierService) {}

  @Post()
  async addToCart(@Body() createPannierDto: CreatePannierDto) {
    return this.pannierService.addToCart(createPannierDto);
  }

  @Delete(':userId/produit/:produitId')
  async removeFromCart(
    @Param('userId') userId: number,
    @Param('produitId') produitId: number,
  ) {
    return this.pannierService.removeFromCart(userId, produitId);
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: number) {
    return this.pannierService.getCart(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.pannierService.clearCart(id);
  }
}
