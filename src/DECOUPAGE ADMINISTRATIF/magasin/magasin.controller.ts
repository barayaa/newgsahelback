import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MagasinService } from './magasin.service';
import { CreateMagasinDto } from './dto/create-magasin.dto';
import { UpdateMagasinDto } from './dto/update-magasin.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('magasin')
export class MagasinController {
  constructor(private readonly magasinService: MagasinService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createMagasinDto: CreateMagasinDto) {
    return this.magasinService.create(createMagasinDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.magasinService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magasinService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMagasinDto: UpdateMagasinDto) {
    return this.magasinService.update(+id, updateMagasinDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magasinService.remove(+id);
  }
}
