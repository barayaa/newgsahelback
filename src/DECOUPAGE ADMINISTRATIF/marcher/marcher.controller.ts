import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarcherService } from './marcher.service';
import { CreateMarcherDto } from './dto/create-marcher.dto';
import { UpdateMarcherDto } from './dto/update-marcher.dto';

@Controller('marcher')
export class MarcherController {
  constructor(private readonly marcherService: MarcherService) {}

  @Post()
  create(@Body() createMarcherDto: CreateMarcherDto) {
    return this.marcherService.create(createMarcherDto);
  }

  @Get()
  findAll() {
    return this.marcherService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarcherDto: UpdateMarcherDto) {
    return this.marcherService.update(+id, updateMarcherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcherService.remove(+id);
  }
}
