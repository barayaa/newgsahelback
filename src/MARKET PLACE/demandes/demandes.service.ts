import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { Demande, StatutDemande } from './entities/demande.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Produit } from '../produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';

@Injectable()
export class DemandesService {
  constructor(
    @InjectRepository(Demande)
    private demandeRepository: Repository<Demande>,
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createDemandeDto: CreateDemandeDto): Promise<Demande> {
    console.log('DTO reçu:', createDemandeDto);

    // Récupérer le produit avec la relation 'user'
    const produit = await this.produitRepository.findOne({
      where: { id: createDemandeDto.produit },
      relations: ['user'], // Inclure l'utilisateur (vendeur)
    });
    if (!produit) {
      throw new BadRequestException('Produit non trouvé');
    }

    // Récupérer l'acheteur
    const acheteur = await this.userRepository.findOne({
      where: { id: createDemandeDto.acheteur },
    });
    if (!acheteur) {
      throw new BadRequestException('Acheteur non trouvé');
    }

    // Le vendeur est l'utilisateur associé au produit
    const vendeur = produit.user;
    if (!vendeur) {
      throw new BadRequestException('Vendeur non trouvé');
    }

    // Créer la demande
    const demande = this.demandeRepository.create({
      quantite: createDemandeDto.quantite,
      montantTotal: createDemandeDto.montantTotal,
      dateLivraisonSouhaitee: new Date(createDemandeDto.dateLivraisonSouhaitee),
      statut: StatutDemande.EN_ATTENTE,
      produit,
      acheteur,
    } as DeepPartial<Demande>);

    // Sauvegarder la demande
    const savedDemande = await this.demandeRepository.save(demande);

    return savedDemande;
  }

  async transmettreAuVendeur(id: number, admin: User): Promise<Demande> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Seul un admin peut transmettre une demande',
      );
    }

    const demande = await this.findOne(id);
    if (demande.statut !== StatutDemande.EN_ATTENTE) {
      throw new BadRequestException('Demande non en attente');
    }

    demande.statut = StatutDemande.TRANSMISE_VENDEUR;
    const updatedDemande = await this.demandeRepository.save(demande);

    return updatedDemande;
  }

  async repondreDemande(
    id: number,
    accepter: boolean,
    vendeurId: number,
  ): Promise<Demande> {
    const demande = await this.findOne(id);
    if (demande.produit.user.id !== vendeurId) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à répondre à cette demande',
      );
    }
    if (demande.statut !== StatutDemande.TRANSMISE_VENDEUR) {
      throw new BadRequestException('Demande non en attente de réponse');
    }

    demande.statut = accepter ? StatutDemande.ACCEPTER : StatutDemande.REFUSER;
    const updatedDemande = await this.demandeRepository.save(demande);

    return updatedDemande;
  }

  async confirmerPaiement(
    id: number,
    paiementReference: string,
    admin: User,
  ): Promise<Demande> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Seul un admin peut confirmer un paiement');
    }

    const demande = await this.findOne(id);
    if (demande.statut !== StatutDemande.ACCEPTER) {
      throw new BadRequestException('Demande non acceptée');
    }

    demande.statut = StatutDemande.PAYER;
    // demande.paiementReference = paiementReference;
    const updatedDemande = await this.demandeRepository.save(demande);

    const produit = await this.produitRepository.findOne({
      where: { id: demande.produit.id },
    });
    produit.quantite -= demande.quantite;
    if (produit.quantite < 0) {
      throw new BadRequestException('Stock insuffisant');
    }
    await this.produitRepository.save(produit);

    updatedDemande.statut = StatutDemande.EN_LIVRAISON;
    await this.demandeRepository.save(updatedDemande);

    return updatedDemande;
  }

  // async confirmerLivraison(id: number, acheteurId: number): Promise<Demande> {
  //   const demande = await this.findOne(id);
  //   if (demande.acheteur.id !== acheteurId) {
  //     throw new ForbiddenException(
  //       'Vous n’êtes pas autorisé à confirmer cette livraison',
  //     );
  //   }
  //   if (demande.statut !== StatutDemande.EN_LIVRAISON) {
  //     throw new BadRequestException('Demande non en cours de livraison');
  //   }

  //   demande.statut = StatutDemande.LIVREE;
  //   demande.livraisonConfirmeeParAcheteur = true;
  //   const updatedDemande = await this.demandeRepository.save(demande);

  //   await this.mailerService.sendMail({
  //     to: this.configService.get('ADMIN_EMAIL'),
  //     subject: `Livraison confirmée pour la demande #${demande.id}`,
  //     template: './livraison-confirmee',
  //     context: {
  //       demandeId: demande.id,
  //       produit: demande.produit.nom,
  //       acheteur: demande.acheteur.email,
  //     },
  //   });

  //   await this.mailerService.sendMail({
  //     to: demande.produit.user.email,
  //     subject: `Livraison confirmée pour la demande #${demande.id}`,
  //     template: './livraison-vendeur',
  //     context: {
  //       demandeId: demande.id,
  //       produit: demande.produit.nom,
  //     },
  //   });

  //   return updatedDemande;
  // }

  // async finaliserTransaction(id: number, admin: User): Promise<Demande> {
  //   if (admin.role !== Role.ADMIN) {
  //     throw new ForbiddenException(
  //       'Seul un admin peut finaliser une transaction',
  //     );
  //   }

  //   const demande = await this.findOne(id);
  //   if (
  //     demande.statut !== StatutDemande.LIVREE ||
  //     !demande.livraisonConfirmeeParAcheteur
  //   ) {
  //     throw new BadRequestException('Livraison non confirmée');
  //   }

  //   demande.statut = StatutDemande.COMPLETEE;
  //   const updatedDemande = await this.demandeRepository.save(demande);

  //   await this.mailerService.sendMail({
  //     to: demande.vendeur.email,
  //     subject: `Paiement transféré pour la demande #${demande.id}`,
  //     template: './paiement-transfere',
  //     context: {
  //       demandeId: demande.id,
  //       produit: demande.produit.nom,
  //       montant: demande.montantTotal,
  //     },
  //   });

  //   await this.mailerService.sendMail({
  //     to: demande.acheteur.email,
  //     subject: `Transaction #${demande.id} finalisée`,
  //     template: './transaction-finalisee',
  //     context: {
  //       demandeId: demande.id,
  //       produit: demande.produit.nom,
  //     },
  //   });

  //   return updatedDemande;
  // }

  async findAll(): Promise<Demande[]> {
    const demandes = await this.demandeRepository.find({
      relations: {
        produit: true,
        acheteur: true,
      },
    });
    return demandes;
  }

  async findOne(id: number): Promise<Demande> {
    console.log(`Récupération de la demande #${id}`);
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit'],
    });
    if (!demande) {
      throw new BadRequestException(`Demande #${id} non trouvée`);
    }
    return demande;
  }
  async findDemandsBySeller(sellerId: number): Promise<Demande[]> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    // Récupérer les demandes où l'utilisateur est vendeur (via produit.userId)
    const demands = await this.demandeRepository
      .createQueryBuilder('demande')
      .leftJoinAndSelect('demande.produit', 'produit')
      .leftJoinAndSelect('produit.user', 'vendeur')
      .leftJoinAndSelect('demande.acheteur', 'acheteur')
      .where('produit.userId = :sellerId', { sellerId })
      .getMany();

    return demands;
  }

  async findDemandsByBuyer(buyerId: number): Promise<Demande[]> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!user) {
      throw new BadRequestException('Utilisateur non trouvé');
    }

    // Récupérer les demandes où l'utilisateur est acheteur
    const demands = await this.demandeRepository
      .createQueryBuilder('demande')
      .leftJoinAndSelect('demande.produit', 'produit')
      .leftJoinAndSelect('produit.user', 'vendeur')
      .leftJoinAndSelect('demande.acheteur', 'acheteur')
      .where('demande.acheteurId = :buyerId', { buyerId })
      .getMany();

    return demands;
  }

  // async findByAcheteur(acheteurId: number): Promise<Demande[]> {
  //   const demandes = await this.demandeRepository.find({
  //     where: { acheteur: { id: acheteurId } },
  //     relations: ['produit', 'acheteur'],
  //   });
  //   return demandes;
  // }

  // async findByVendeur(vendeurId: number): Promise<Demande[]> {
  //   const demandes = await this.demandeRepository.find({
  //     where: { produit: { user: { id: vendeurId } } },
  //     relations: ['produit', 'acheteur'],
  //   });
  //   return demandes;
  // }

  async findByProduit(produitId: number): Promise<Demande[]> {
    const demandes = await this.demandeRepository.find({
      where: { produit: { id: produitId } },
      relations: ['produit', 'acheteur'],
    });
    return demandes;
  }

  async update(
    id: number,
    updateDemandeDto: UpdateDemandeDto,
  ): Promise<Demande> {
    // Récupérer la demande existante avec les relations
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) {
      throw new BadRequestException('Demande non trouvée');
    }

    // Récupérer le produit si modifié
    let produit = demande.produit;
    if (updateDemandeDto.produit && updateDemandeDto.produit !== produit.id) {
      produit = await this.produitRepository.findOne({
        where: { id: updateDemandeDto.produit },
        relations: ['user'],
      });
      if (!produit) {
        throw new BadRequestException('Produit non trouvé');
      }
    }

    // Récupérer l'acheteur si modifié
    let acheteur = demande.acheteur;
    if (
      updateDemandeDto.acheteur &&
      updateDemandeDto.acheteur !== acheteur.id
    ) {
      acheteur = await this.userRepository.findOne({
        where: { id: updateDemandeDto.acheteur },
      });
      if (!acheteur) {
        throw new BadRequestException('Acheteur non trouvé');
      }
    }

    // Le vendeur est l'utilisateur associé au produit
    const vendeur = produit.user;
    if (!vendeur) {
      throw new BadRequestException('Vendeur non trouvé');
    }

    // Mettre à jour les champs de la demande
    const updatedDemande = Object.assign(demande, {
      quantite: updateDemandeDto.quantite ?? demande.quantite,
      montantTotal: updateDemandeDto.montantTotal ?? demande.montantTotal,
      dateLivraisonSouhaitee: updateDemandeDto.dateLivraisonSouhaitee
        ? new Date(updateDemandeDto.dateLivraisonSouhaitee)
        : demande.dateLivraisonSouhaitee,
      statut: updateDemandeDto.statut ?? demande.statut,
      produit: produit,
      acheteur: acheteur,
    });

    // Sauvegarder la demande mise à jour
    const savedDemande = await this.demandeRepository.save(updatedDemande);

    return savedDemande;
  }

  async remove(id: number): Promise<void> {
    // Récupérer la demande avec les relations
    const demande = await this.demandeRepository.findOne({
      where: { id },
      relations: ['produit', 'produit.user', 'acheteur'],
    });
    if (!demande) {
      throw new BadRequestException('Demande non trouvée');
    }

    // Supprimer la demande
    await this.demandeRepository.remove(demande);
  }
}
