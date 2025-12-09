import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommuneService } from './commune.service';
import { CreateCommuneDto } from './dto/create-commune.dto';
import { UpdateCommuneDto } from './dto/update-commune.dto';

@Controller('commune')
export class CommuneController {
  constructor(private readonly communeService: CommuneService) {}

  @Post()
  create(@Body() createCommuneDto: CreateCommuneDto) {
    return this.communeService.create(createCommuneDto);
  }

  @Get()
  findAll() {
    return this.communeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommuneDto: UpdateCommuneDto) {
    return this.communeService.update(+id, updateCommuneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communeService.remove(+id);
  }
}
