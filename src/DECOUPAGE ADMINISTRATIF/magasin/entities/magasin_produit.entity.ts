import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Magasin } from './magasin.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';

@Entity()
export class MagasinProduit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Magasin, (magasin) => magasin.magasinProduits)
  magasin: Magasin;

  @ManyToOne(() => Produit, (produit) => produit.magasinProduits)
  produit: Produit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
