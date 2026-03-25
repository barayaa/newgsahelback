import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { ActiveUserDecorator } from 'src/auth/decorators/active.user.decorators';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Controller('demandes')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Auth(AuthType.None)
  @Get('seller/:sellerId')
  findDemandsBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.demandesService.findDemandsBySeller(sellerId);
  }

  @Auth(AuthType.None)
  @Get('buyer/:buyerId')
  findDemandsByBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
    return this.demandesService.findDemandsByBuyer(buyerId);
  }

  @Auth(AuthType.None)
  @Post()
  create(@Body() createDemandeDto: CreateDemandeDto) {
    return this.demandesService.create(createDemandeDto);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.demandesService.findOne(id);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.demandesService.findAll();
  }

  @Auth(AuthType.None)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDemandeDto: UpdateDemandeDto,
  ) {
    return this.demandesService.update(id, updateDemandeDto);
  }

  @Auth(AuthType.None)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demandesService.remove(id);
  }

  /** Seller responds (accept/refuse) */
  @Post(':id/repondre')
  repondreDemande(
    @Param('id', ParseIntPipe) id: number,
    @Body('accepter') accepter: boolean,
    @ActiveUserDecorator() user: User,
  ) {
    if (user.role !== Role.VENDEUR) {
      throw new ForbiddenException('Seul un vendeur peut répondre à une demande');
    }
    return this.demandesService.repondreDemande(id, accepter, user.id);
  }

  /** Seller marks order as shipped */
  @Post(':id/livraison')
  marquerEnLivraison(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUserDecorator() user: User,
  ) {
    return this.demandesService.marquerEnLivraison(id, user.id);
  }

  /** Buyer confirms receipt */
  @Post(':id/confirmer-livraison')
  confirmerLivraison(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUserDecorator() user: User,
  ) {
    return this.demandesService.confirmerLivraison(id, user.id);
  }

  @Post(':id/paiement')
  confirmerPaiement(
    @Param('id', ParseIntPipe) id: number,
    @Body('paiementReference') paiementReference: string,
    @ActiveUserDecorator() user: User,
  ) {
    return this.demandesService.confirmerPaiement(id, paiementReference, user);
  }
}
