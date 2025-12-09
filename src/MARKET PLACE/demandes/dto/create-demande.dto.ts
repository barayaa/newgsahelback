import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { StatutDemande } from '../entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';

export class CreateDemandeDto {
  id: number;
  produit: number;
  quantite: number;
  montantTotal: number;
  statut: StatutDemande;
  acheteur: number;
  // etat: string;
  dateLivraisonSouhaitee: Date;
}
