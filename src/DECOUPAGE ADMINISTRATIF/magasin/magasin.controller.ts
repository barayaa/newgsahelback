import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MagasinService } from './magasin.service';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import { UpdateMagasinDto } from './dto/update-magasin.dto';

@Controller('magasin')
export class MagasinController {
  constructor(private readonly magasinService: MagasinService) {}

  @Post()
  create(@Body() createMagasinDto: CreateMagasinDto) {
    return this.magasinService.create(createMagasinDto);
  }

  @Get()
  findAll() {
    return this.magasinService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magasinService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMagasinDto: UpdateMagasinDto) {
    return this.magasinService.update(+id, updateMagasinDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magasinService.remove(+id);
  }
}
