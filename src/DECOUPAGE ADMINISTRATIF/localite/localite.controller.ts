import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocaliteService } from './localite.service';
import { CreateLocaliteDto } from './dto/create-localite.dto';
import { UpdateLocaliteDto } from './dto/update-localite.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('localite')
export class LocaliteController {
  constructor(private readonly localiteService: LocaliteService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createLocaliteDto: CreateLocaliteDto) {
    return this.localiteService.create(createLocaliteDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.localiteService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localiteService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocaliteDto: UpdateLocaliteDto) {
    return this.localiteService.update(+id, updateLocaliteDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localiteService.remove(+id);
  }
}
