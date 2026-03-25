import {
  BadRequestException, ForbiddenException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Litige, StatutLitige } from './entities/litige.entity';
import { Demande, StatutDemande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { NotificationType } from 'src/notifications/entities/notification.entity';

@Injectable()
export class EscrowService {
  private readonly COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '0.05');
  private readonly AUTO_RELEASE_DAYS = parseInt(process.env.AUTO_RELEASE_DAYS || '7');
  private readonly CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
  private readonly CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
  private readonly FRONTEND_URL = process.env.FRONTEND_URL || 'https://grenier-sahel.org';
  private readonly API_URL = process.env.API_URL || 'https://poc4ogw8o8s00o0cs00wckg4.vpscoolify.aslogisticniger.com';

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Litige)  private litigeRepo:  Repository<Litige>,
    @InjectRepository(Demande) private demandeRepo: Repository<Demande>,
    @InjectRepository(User)    private userRepo:    Repository<User>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // ─── Initier un paiement ──────────────────────────────────────────────────
  async initierPaiement(demandeId: number, acheteurId: number, telephone: string) {
    const demande = await this.demandeRepo.findOne({
      where: { id: demandeId },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (demande.acheteur.id !== acheteurId) throw new ForbiddenException('Non autorisé');
    if (demande.statut !== StatutDemande.ACCEPTER) {
      throw new BadRequestException('La demande doit être acceptée par le vendeur avant le paiement');
    }

    const existing = await this.paymentRepo.findOne({
      where: { demande: { id: demandeId }, statut: In([PaymentStatus.EN_ATTENTE, PaymentStatus.TENU]) },
    });
    if (existing) throw new BadRequestException('Un paiement est déjà en cours pour cette commande');

    const montant    = Math.round(Number(demande.montantTotal));
    const commission = Math.round(montant * this.COMMISSION_RATE);
    const montantVendeur = montant - commission;
    const transactionId  = `GDS-${demandeId}-${Date.now()}`;

    const payment = this.paymentRepo.create({
      transactionId,
      montant,
      commission,
      montantVendeur,
      telephoneAcheteur: telephone,
      telephoneVendeur:  demande.produit.user.telephone,
      statut: PaymentStatus.EN_ATTENTE,
      demande,
      acheteur:     { id: acheteurId } as User,
      vendeur:      demande.produit.user,
      autoReleaseAt: new Date(Date.now() + this.AUTO_RELEASE_DAYS * 86_400_000),
    });
    await this.paymentRepo.save(payment);

    // Appel CinetPay
    const body = {
      apikey: this.CINETPAY_API_KEY,
      site_id: this.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: montant,
      currency: 'XOF',
      description: `Commande #${demandeId} — ${demande.produit.nom}`,
      return_url: `${this.FRONTEND_URL}/private/payment-retour?tx=${transactionId}`,
      notify_url: `${this.API_URL}/gds/api/escrow/webhook`,
      customer_name:         demande.acheteur.nom,
      customer_surname:      demande.acheteur.prenom,
      customer_phone_number: telephone,
      customer_email:        demande.acheteur.email,
      channels: 'MOBILE_MONEY',
      metadata: `${demandeId}`,
    };

    const res  = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data: any = await res.json();

    if (data.code !== '201') {
      await this.paymentRepo.update(payment.id, { statut: PaymentStatus.ECHEC });
      throw new BadRequestException(data.description || 'Erreur CinetPay — réessayez');
    }

    return { paymentUrl: data.data.payment_url, transactionId };
  }

  // ─── Webhook CinetPay ─────────────────────────────────────────────────────
  async handleWebhook(body: any): Promise<void> {
    const { cpm_trans_id, cpm_payid, payment_method } = body;

    // Double vérification auprès de CinetPay
    const verifRes = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:         this.CINETPAY_API_KEY,
        site_id:        this.CINETPAY_SITE_ID,
        transaction_id: cpm_trans_id,
      }),
    });
    const verif: any = await verifRes.json();
    if (verif.code !== '00' || verif.data?.status !== 'ACCEPTED') return;

    const payment = await this.paymentRepo.findOne({
      where: { transactionId: cpm_trans_id },
      relations: ['demande', 'demande.produit', 'acheteur', 'vendeur'],
    });
    if (!payment || payment.statut !== PaymentStatus.EN_ATTENTE) return;

    payment.statut            = PaymentStatus.TENU;
    payment.cinetpayPayId     = cpm_payid;
    payment.cinetpayOperateur = payment_method;
    await this.paymentRepo.save(payment);

    await this.demandeRepo.update(payment.demande.id, { statut: StatutDemande.PAYER });

    // Notifier vendeur
    const nv = await this.notificationsService.create(
      payment.vendeur.id,
      'Paiement reçu — Expédiez la commande 🚀',
      `Le paiement de ${payment.montant} XOF pour "${payment.demande.produit.nom}" est confirmé. Préparez la livraison.`,
      NotificationType.SYSTEME, payment.demande.id,
    );
    if (nv) this.notificationsGateway.broadcastNotification(payment.vendeur.id, nv);

    // Notifier acheteur
    const na = await this.notificationsService.create(
      payment.acheteur.id,
      'Paiement confirmé ✓',
      `Votre paiement de ${payment.montant} XOF a été reçu. Le vendeur prépare votre commande.`,
      NotificationType.SYSTEME, payment.demande.id,
    );
    if (na) this.notificationsGateway.broadcastNotification(payment.acheteur.id, na);
  }

  // ─── Vérifier le statut d'un paiement ────────────────────────────────────
  async verifierStatut(transactionId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { transactionId },
      relations: ['demande', 'litiges'],
    });
    if (!payment) throw new NotFoundException('Transaction non trouvée');
    return payment;
  }

  // ─── Libérer les fonds vers le vendeur ───────────────────────────────────
  async libererFonds(demandeId: number): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { demande: { id: demandeId }, statut: PaymentStatus.TENU },
      relations: ['vendeur', 'acheteur', 'demande', 'demande.produit'],
    });
    if (!payment) return;

    payment.statut   = PaymentStatus.LIBERE;
    payment.libereLe = new Date();
    await this.paymentRepo.save(payment);

    await this.demandeRepo.update(demandeId, { statut: StatutDemande.COMPLETER });

    const nv = await this.notificationsService.create(
      payment.vendeur.id,
      'Fonds libérés 💰',
      `${payment.montantVendeur} XOF vous seront virés sur votre Mobile Money (${payment.montant} XOF - ${payment.commission} XOF de commission plateforme).`,
      NotificationType.SYSTEME, demandeId,
    );
    if (nv) this.notificationsGateway.broadcastNotification(payment.vendeur.id, nv);
  }

  // ─── Cron : auto-libération après X jours sans litige ────────────────────
  @Cron(CronExpression.EVERY_HOUR)
  async autoReleaseExpiredPayments(): Promise<void> {
    const expired = await this.paymentRepo.find({
      where: { statut: PaymentStatus.TENU, autoReleaseAt: LessThan(new Date()) },
      relations: ['demande'],
    });
    for (const p of expired) {
      if (p.demande) await this.libererFonds(p.demande.id);
    }
  }

  // ─── Ouvrir un litige (acheteur) ──────────────────────────────────────────
  async ouvrirLitige(paymentId: number, acheteurId: number, raison: string, preuves?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId, acheteur: { id: acheteurId } },
      relations: ['vendeur', 'acheteur', 'demande'],
    });
    if (!payment) throw new NotFoundException('Paiement non trouvé');
    if (payment.statut !== PaymentStatus.TENU) {
      throw new BadRequestException('Un litige ne peut être ouvert que sur un paiement en cours');
    }

    payment.statut = PaymentStatus.LITIGE;
    await this.paymentRepo.save(payment);

    const litige = this.litigeRepo.create({
      raison, preuves,
      statut:    StatutLitige.OUVERT,
      payment,
      ouvertPar: { id: acheteurId } as User,
    });
    const saved = await this.litigeRepo.save(litige);

    // Notifier le vendeur
    await this.notificationsService.create(
      payment.vendeur.id,
      'Litige ouvert ⚠️',
      `L'acheteur a ouvert un litige : "${raison}". L'admin va intervenir.`,
      NotificationType.SYSTEME, payment.id,
    );
    return saved;
  }

  // ─── Résoudre un litige (admin) ───────────────────────────────────────────
  async resoudreLitige(litigeId: number, resolution: string, faveurAcheteur: boolean, adminId: number) {
    const litige = await this.litigeRepo.findOne({
      where: { id: litigeId },
      relations: ['payment', 'payment.demande', 'payment.vendeur', 'payment.acheteur'],
    });
    if (!litige) throw new NotFoundException('Litige non trouvé');

    litige.statut    = faveurAcheteur ? StatutLitige.RESOLU_ACHETEUR : StatutLitige.RESOLU_VENDEUR;
    litige.resolution = resolution;
    litige.resoluPar  = { id: adminId } as User;
    await this.litigeRepo.save(litige);

    if (faveurAcheteur) {
      litige.payment.statut = PaymentStatus.REMBOURSE;
      await this.paymentRepo.save(litige.payment);
      if (litige.payment.demande) {
        await this.demandeRepo.update(litige.payment.demande.id, { statut: StatutDemande.REFUSER });
      }
      await this.notificationsService.create(
        litige.payment.acheteur.id,
        'Litige résolu — Remboursement ✓',
        `Votre litige a été résolu en votre faveur. ${litige.payment.montant} XOF vous seront remboursés.`,
        NotificationType.SYSTEME,
      );
    } else {
      if (litige.payment.demande) await this.libererFonds(litige.payment.demande.id);
      await this.notificationsService.create(
        litige.payment.acheteur.id,
        'Litige résolu',
        `Votre litige a été résolu en faveur du vendeur. Décision : ${resolution}`,
        NotificationType.SYSTEME,
      );
    }
    return litige;
  }

  // ─── Récupérer mes paiements (acheteur) ──────────────────────────────────
  async getMesPaiements(userId: number) {
    return this.paymentRepo.find({
      where: { acheteur: { id: userId } },
      relations: ['demande', 'demande.produit', 'litiges'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Paiement par demande ─────────────────────────────────────────────────
  async getByDemande(demandeId: number) {
    return this.paymentRepo.findOne({
      where: { demande: { id: demandeId } },
      relations: ['litiges'],
    });
  }

  // ─── Tous les litiges (admin) ─────────────────────────────────────────────
  async getAllLitiges() {
    return this.litigeRepo.find({
      relations: ['payment', 'payment.acheteur', 'payment.vendeur', 'payment.demande', 'ouvertPar'],
      order: { createdAt: 'DESC' },
    });
  }
}
