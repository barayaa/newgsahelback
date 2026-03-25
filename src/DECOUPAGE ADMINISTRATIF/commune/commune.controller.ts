import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommuneService } from './commune.service';
import { CreateCommuneDto } from './dto/create-commune.dto';
import { UpdateCommuneDto } from './dto/update-commune.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('commune')
export class CommuneController {
  constructor(private readonly communeService: CommuneService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createCommuneDto: CreateCommuneDto) {
    return this.communeService.create(createCommuneDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.communeService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communeService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommuneDto: UpdateCommuneDto) {
    return this.communeService.update(+id, updateCommuneDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communeService.remove(+id);
  }
}
