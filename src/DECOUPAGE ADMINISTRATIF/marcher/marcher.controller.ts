import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarcherService } from './marcher.service';
import { CreateMarcherDto } from './dto/create-marcher.dto';
import { UpdateMarcherDto } from './dto/update-marcher.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('marcher')
export class MarcherController {
  constructor(private readonly marcherService: MarcherService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createMarcherDto: CreateMarcherDto) {
    return this.marcherService.create(createMarcherDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.marcherService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcherService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarcherDto: UpdateMarcherDto) {
    return this.marcherService.update(+id, updateMarcherDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcherService.remove(+id);
  }
}
