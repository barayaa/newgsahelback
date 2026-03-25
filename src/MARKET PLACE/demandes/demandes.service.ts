import {
  BadRequestException,
  ForbiddenException,
  Injectable, forwardRef, Inject,
} from '@nestjs/common';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Demande, StatutDemande } from './entities/demande.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Produit } from '../produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { EscrowService } from 'src/escrow/escrow.service';

@Injectable()
export class DemandesService {
  constructor(
    @InjectRepository(Demande)
    private demandeRepository: Repository<Demande>,
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
    @Inject(forwardRef(() => EscrowService)) private escrowService: EscrowService,
  ) {}

  async create(createDemandeDto: CreateDemandeDto): Promise<Demande> {
    const produit = await this.produitRepository.findOne({
      where: { id: createDemandeDto.produit },
      relations: ['user'],
    });
    if (!produit) throw new BadRequestException('Produit non trouvé');

    const acheteur = await this.userRepository.findOne({
      where: { id: createDemandeDto.acheteur },
    });
    if (!acheteur) throw new BadRequestException('Acheteur non trouvé');

    const vendeur = produit.user;
    if (!vendeur) throw new BadRequestException('Vendeur non trouvé');

    const demande = this.demandeRepository.create({
      quantite: createDemandeDto.quantite,
      montantTotal: createDemandeDto.montantTotal,
      dateLivraisonSouhaitee: createDemandeDto.dateLivraisonSouhaitee
        ? new Date(createDemandeDto.dateLivraisonSouhaitee)
        : null,
      statut: StatutDemande.TRANSMISE_VENDEUR,
      produit,
      acheteur,
    } as DeepPartial<Demande>);

    const savedDemande = await this.demandeRepository.save(demande);

    // Notify seller
    const notif = await this.notificationsService.create(
      vendeur.id,
      'Nouvelle demande reçue',
      `${acheteur.prenom} ${acheteur.nom} a commandé ${createDemandeDto.quantite} unité(s) de "${produit.nom}"`,
      NotificationType.DEMANDE_RECUE,
      savedDemande.id,
    );
    if (notif) this.notificationsGateway.broadcastNotification(vendeur.id, notif);

    return savedDemande;
  }

  async repondreDemande(id: number, accepter: boolean, vendeurId: number): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException(`Demande #${id} non trouvée`);

    if (demande.produit.user.id !== vendeurId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à répondre à cette demande');
    }

    const allowedStatuts = [StatutDemande.TRANSMISE_VENDEUR, StatutDemande.EN_ATTENTE];
    if (!allowedStatuts.includes(demande.statut)) {
      throw new BadRequestException('Cette demande ne peut plus être modifiée');
    }

    demande.statut = accepter ? StatutDemande.ACCEPTER : StatutDemande.REFUSER;
    const updated = await this.demandeRepository.save(demande);

    // Notify buyer
    const type = accepter ? NotificationType.DEMANDE_VALIDEE : NotificationType.DEMANDE_REJETEE;
    const titre = accepter ? 'Demande acceptée ✓' : 'Demande refusée';
    const message = accepter
      ? `Votre demande pour "${demande.produit.nom}" a été acceptée par le vendeur.`
      : `Votre demande pour "${demande.produit.nom}" a été refusée par le vendeur.`;

    const notif = await this.notificationsService.create(
      demande.acheteur.id, titre, message, type, demande.id,
    );
    if (notif) this.notificationsGateway.broadcastNotification(demande.acheteur.id, notif);

    return updated;
  }

  async marquerEnLivraison(id: number, vendeurId: number): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException(`Demande #${id} non trouvée`);

    if (demande.produit.user.id !== vendeurId) {
      throw new ForbiddenException('Action non autorisée');
    }
    if (demande.statut !== StatutDemande.ACCEPTER) {
      throw new BadRequestException('La demande doit être acceptée avant la livraison');
    }

    // Update stock
    const produit = await this.produitRepository.findOne({ where: { id: demande.produit.id } });
    if (produit.quantite < demande.quantite) throw new BadRequestException('Stock insuffisant');
    produit.quantite -= demande.quantite;
    await this.produitRepository.save(produit);

    demande.statut = StatutDemande.EN_LIVRAISON;
    const updated = await this.demandeRepository.save(demande);

    // Notify buyer
    const notif = await this.notificationsService.create(
      demande.acheteur.id,
      'Commande en cours de livraison 🚚',
      `Votre commande de "${demande.produit.nom}" est en cours de livraison.`,
      NotificationType.SYSTEME,
      demande.id,
    );
    if (notif) this.notificationsGateway.broadcastNotification(demande.acheteur.id, notif);

    return updated;
  }

  async confirmerLivraison(id: number, acheteurId: number): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException(`Demande #${id} non trouvée`);

    if (demande.acheteur.id !== acheteurId) {
      throw new ForbiddenException('Action non autorisée');
    }
    if (demande.statut !== StatutDemande.EN_LIVRAISON) {
      throw new BadRequestException('La commande n\'est pas encore en livraison');
    }

    demande.statut = StatutDemande.LIVRER;
    const updated = await this.demandeRepository.save(demande);

    // Libérer les fonds en escrow vers le vendeur
    await this.escrowService.libererFonds(demande.id);

    // Notify seller
    const notif = await this.notificationsService.create(
      demande.produit.user.id,
      'Livraison confirmée — Fonds libérés 💰',
      `L'acheteur a confirmé la réception de "${demande.produit.nom}". Vos fonds sont en cours de virement.`,
      NotificationType.SYSTEME,
      demande.id,
    );
    if (notif) this.notificationsGateway.broadcastNotification(demande.produit.user.id, notif);

    return updated;
  }

  async transmettreAuVendeur(id: number): Promise<Demande> {
    const demande = await this.findOne(id);
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException('Demande non en attente');
    }
    demande.statut = StatutDemande.TRANSMISE_VENDEUR;
    return this.demandeRepository.save(demande);
  }

  async confirmerPaiement(id: number, paiementReference: string, admin: User): Promise<Demande> {
    const demande = await this.findOne(id);
    if (demande.statut !== StatutDemande.ACCEPTER) {
      throw new BadRequestException('Demande non acceptée');
    }

    demande.statut = StatutDemande.PAYER;
    const updated = await this.demandeRepository.save(demande);

    const produit = await this.produitRepository.findOne({ where: { id: demande.produit.id } });
    produit.quantite -= demande.quantite;
    if (produit.quantite < 0) throw new BadRequestException('Stock insuffisant');
    await this.produitRepository.save(produit);

    updated.statut = StatutDemande.EN_LIVRAISON;
    await this.demandeRepository.save(updated);

    return updated;
  }

  async findAll(): Promise<Demande[]> {
    return this.demandeRepository.find({
      relations: { produit: true, acheteur: true },
    });
  }

  async findOne(id: number): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException(`Demande #${id} non trouvée`);
    return demande;
  }

  async findDemandsBySeller(sellerId: number): Promise<Demande[]> {
    const user = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    return this.demandeRepository
      .createQueryBuilder('demande')
      .leftJoinAndSelect('demande.produit', 'produit')
      .leftJoinAndSelect('produit.user', 'vendeur')
      .leftJoinAndSelect('demande.acheteur', 'acheteur')
      .where('produit.userId = :sellerId', { sellerId })
      .orderBy('demande.createdAt', 'DESC')
      .getMany();
  }

  async findDemandsByBuyer(buyerId: number): Promise<Demande[]> {
    const user = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!user) throw new BadRequestException('Utilisateur non trouvé');

    return this.demandeRepository
      .createQueryBuilder('demande')
      .leftJoinAndSelect('demande.produit', 'produit')
      .leftJoinAndSelect('produit.user', 'vendeur')
      .leftJoinAndSelect('demande.acheteur', 'acheteur')
      .where('demande.acheteurId = :buyerId', { buyerId })
      .orderBy('demande.createdAt', 'DESC')
      .getMany();
  }

  async findByProduit(produitId: number): Promise<Demande[]> {
    return this.demandeRepository.find({
      where: { produit: { id: produitId } },
      relations: ['produit', 'acheteur'],
    });
  }

  async update(id: number, updateDemandeDto: UpdateDemandeDto): Promise<Demande> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException('Demande non trouvée');

    let produit = demande.produit;
    if (updateDemandeDto.produit && updateDemandeDto.produit !== produit.id) {
      produit = await this.produitRepository.findOne({
        where: { id: updateDemandeDto.produit },
        relations: ['user'],
      });
      if (!produit) throw new BadRequestException('Produit non trouvé');
    }

    let acheteur = demande.acheteur;
    if (updateDemandeDto.acheteur && updateDemandeDto.acheteur !== acheteur.id) {
      acheteur = await this.userRepository.findOne({ where: { id: updateDemandeDto.acheteur } });
      if (!acheteur) throw new BadRequestException('Acheteur non trouvé');
    }

    const updated = Object.assign(demande, {
      quantite: updateDemandeDto.quantite ?? demande.quantite,
      montantTotal: updateDemandeDto.montantTotal ?? demande.montantTotal,
      dateLivraisonSouhaitee: updateDemandeDto.dateLivraisonSouhaitee
        ? new Date(updateDemandeDto.dateLivraisonSouhaitee)
        : demande.dateLivraisonSouhaitee,
      statut: updateDemandeDto.statut ?? demande.statut,
      produit,
      acheteur,
    });

    return this.demandeRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) throw new BadRequestException('Demande non trouvée');
    await this.demandeRepository.remove(demande);
  }
}
