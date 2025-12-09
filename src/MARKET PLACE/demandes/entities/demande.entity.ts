import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StatutDemande {
  EN_ATTENTE = 'EN_ATTENTE',
  TRANSMISE_VENDEUR = 'TRANSMISE_VENDEUR',
  ACCEPTER = 'ACCEPTER',
  REFUSER = 'REFUSER',
  PAYER = 'PAYER',
  EN_LIVRAISON = 'EN_LIVRAISON',
  LIVRER = 'LIVRER',
  COMPLETER = 'COMPLETER',
}

@Entity()
export class Demande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantite: number;

  @ManyToOne(() => Produit, (produit) => produit.demandes, {
    onDelete: 'CASCADE',
  })
  produit: Produit;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  montantTotal: number;

  @Column({
    type: 'enum',
    enum: StatutDemande,
    default: StatutDemande.EN_ATTENTE,
  })
  statut: StatutDemande;

  @ManyToOne(() => User, (user) => user.demandes, { onDelete: 'SET NULL' })
  acheteur: User;

  @Column({ type: 'date', nullable: true })
  dateLivraisonSouhaitee: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
