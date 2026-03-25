import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { Roles } from 'src/auth/authorization/role.decorators';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.regionService.findAll();
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(+id);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    return this.regionService.update(+id, updateRegionDto);
  }

  @Auth(AuthType.Bearer) @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(+id);
  }
}
