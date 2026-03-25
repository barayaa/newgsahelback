import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartementService } from './departement.service';
import { CreateDepartementDto } from './dto/create-departement.dto';
import { UpdateDepartementDto } from './dto/update-departement.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('departement')
export class DepartementController {
  constructor(private readonly departementService: DepartementService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createDepartementDto: CreateDepartementDto) {
    return this.departementService.create(createDepartementDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.departementService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departementService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartementDto: UpdateDepartementDto) {
    return this.departementService.update(+id, updateDepartementDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departementService.remove(+id);
  }
}
