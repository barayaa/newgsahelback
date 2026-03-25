import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UniteService } from './unite.service';
import { CreateUniteDto } from './dto/create-unite.dto';
import { UpdateUniteDto } from './dto/update-unite.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('unite')
export class UniteController {
  constructor(private readonly uniteService: UniteService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createUniteDto: CreateUniteDto) {
    return this.uniteService.create(createUniteDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.uniteService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uniteService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUniteDto: UpdateUniteDto) {
    return this.uniteService.update(+id, updateUniteDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.uniteService.remove(+id);
  }
}
