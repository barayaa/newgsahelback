import {
  Body, Controller, Get, Param, ParseIntPipe,
  Post, Query,
} from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { AuthType } from 'src/auth/enums/auth.types.enum';
import { ActiveUserDecorator } from 'src/auth/decorators/active.user.decorators';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { InitierPaiementDto } from './dto/initier-paiement.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  /** Acheteur initie le paiement Mobile Money */
  @Post('initier/:demandeId')
  initierPaiement(
    @Param('demandeId', ParseIntPipe) demandeId: number,
    @Body() dto: InitierPaiementDto,
    @ActiveUserDecorator() user: User,
  ) {
    return this.escrowService.initierPaiement(demandeId, user.id, dto.telephone);
  }

  /** Webhook CinetPay — pas d'auth */
  @Auth(AuthType.None)
  @Post('webhook')
  webhook(@Body() body: any) {
    return this.escrowService.handleWebhook(body);
  }

  /** Vérifier le statut après retour CinetPay */
  @Auth(AuthType.None)
  @Get('verifier/:transactionId')
  verifier(@Param('transactionId') transactionId: string) {
    return this.escrowService.verifierStatut(transactionId);
  }

  /** Mes paiements (acheteur connecté) */
  @Get('mes-paiements')
  mesPaiements(@ActiveUserDecorator() user: User) {
    return this.escrowService.getMesPaiements(user.id);
  }

  /** Paiement lié à une demande */
  @Auth(AuthType.None)
  @Get('demande/:demandeId')
  byDemande(@Param('demandeId', ParseIntPipe) demandeId: number) {
    return this.escrowService.getByDemande(demandeId);
  }

  /** Acheteur ouvre un litige */
  @Post('litiges/:paymentId')
  ouvrirLitige(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @Body('raison') raison: string,
    @Body('preuves') preuves: string,
    @ActiveUserDecorator() user: User,
  ) {
    return this.escrowService.ouvrirLitige(paymentId, user.id, raison, preuves);
  }

  /** Admin résout un litige */
  @Post('litiges/:id/resoudre')
  resoudreLitige(
    @Param('id', ParseIntPipe) id: number,
    @Body('resolution') resolution: string,
    @Body('faveurAcheteur') faveurAcheteur: boolean,
    @ActiveUserDecorator() user: User,
  ) {
    return this.escrowService.resoudreLitige(id, resolution, faveurAcheteur, user.id);
  }

  /** Admin : tous les litiges */
  @Auth(AuthType.None)
  @Get('litiges')
  allLitiges() {
    return this.escrowService.getAllLitiges();
  }
}
