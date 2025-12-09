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
import { Demande } from './entities/demande.entity';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
// import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('demandes')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Get('seller/:sellerId')
  // @ApiOperation({
  //   summary: 'Récupérer toutes les demandes où l’utilisateur est vendeur',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Liste des demandes récupérée avec succès.',
  // })
  // @ApiResponse({ status: 400, description: 'Utilisateur non trouvé.' })
  findDemandsBySeller(@Param('sellerId', ParseIntPipe) sellerId: number) {
    return this.demandesService.findDemandsBySeller(sellerId);
  }

  @Get('buyer/:buyerId')
  // @ApiOperation({
  //   summary: 'Récupérer toutes les demandes où l’utilisateur est acheteur',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Liste des demandes récupérée avec succès.',
  // })
  // @ApiResponse({ status: 400, description: 'Utilisateur non trouvé.' })
  findDemandsByBuyer(@Param('buyerId', ParseIntPipe) buyerId: number) {
    return this.demandesService.findDemandsByBuyer(buyerId);
  }

  @Post()
  create(@Body() createDemandeDto: CreateDemandeDto) {
    return this.demandesService.create(createDemandeDto);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandesService.findOne(+id);
  }

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.demandesService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDemandeDto: UpdateDemandeDto,
  ) {
    return this.demandesService.update(id, updateDemandeDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.demandesService.remove(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: number, @ActiveUserDecorator() user: User) {
  //   return this.demandesService.remove(id);
  // }

  @Post(':id/transmettre')
  transmettreAuVendeur(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUserDecorator() user: User,
  ): Promise<Demande> {
    return this.demandesService.transmettreAuVendeur(id, user);
  }

  @Post(':id/repondre')
  repondreDemande(
    @Param('id', ParseIntPipe) id: number,
    @Body('accepter') accepter: boolean,
    @ActiveUserDecorator() user: User,
  ): Promise<Demande> {
    if (user.role !== Role.VENDEUR) {
      throw new ForbiddenException(
        'Seul un vendeur peut répondre à une demande',
      );
    }
    return this.demandesService.repondreDemande(id, accepter, user.id);
  }

  @Post(':id/paiement')
  confirmerPaiement(
    @Param('id', ParseIntPipe) id: number,
    @Body('paiementReference') paiementReference: string,
    @ActiveUserDecorator() user: User,
  ): Promise<Demande> {
    return this.demandesService.confirmerPaiement(id, paiementReference, user);
  }

  // @Post(':id/livraison')
  // confirmerLivraison(
  //   @Param('id', ParseIntPipe) id: number,
  //   @ActiveUserDecorator() user: User,
  // ): Promise<Demande> {
  //   return this.demandesService.confirmerLivraison(id, user.id);
  // }

  // @Post(':id/finaliser')
  // finaliserTransaction(
  //   @Param('id', ParseIntPipe) id: number,
  //   @ActiveUserDecorator() user: User,
  // ): Promise<Demande> {
  //   return this.demandesService.finaliserTransaction(id, user);
  // }
}
