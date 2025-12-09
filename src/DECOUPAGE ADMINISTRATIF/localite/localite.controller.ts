import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocaliteService } from './localite.service';
import { CreateLocaliteDto } from './dto/create-localite.dto';
import { UpdateLocaliteDto } from './dto/update-localite.dto';

@Controller('localite')
export class LocaliteController {
  constructor(private readonly localiteService: LocaliteService) {}

  @Post()
  create(@Body() createLocaliteDto: CreateLocaliteDto) {
    return this.localiteService.create(createLocaliteDto);
  }

  @Get()
  findAll() {
    return this.localiteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localiteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocaliteDto: UpdateLocaliteDto) {
    return this.localiteService.update(+id, updateLocaliteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localiteService.remove(+id);
  }
}
