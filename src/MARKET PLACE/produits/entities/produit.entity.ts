import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import { MagasinProduit } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin_produit.entity';
import { Category } from 'src/MARKET PLACE/categories/entities/category.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { Pannier } from 'src/MARKET PLACE/pannier/entities/pannier.entity';
import { Unites } from 'src/MARKET PLACE/unite/entities/unite.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Produit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix: number;

  // @Column({
  //   nullable: true,
  // })
  // unite: string;

  @Column()
  quantite: number;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.produits, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Category, (categorie) => categorie.produits, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @OneToMany(() => Demande, (demande) => demande.produit, {
    onDelete: 'SET NULL',
  })
  demandes: Demande[];

  @ManyToOne(() => Localite, (localite) => localite.produits, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  localite: Localite;

  @OneToMany(() => MagasinProduit, (magasinProduit) => magasinProduit.produit, {
    onDelete: 'CASCADE',
  })
  magasinProduits: MagasinProduit[];

  @ManyToOne(() => Unites, (unites) => unites.produits, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  unite: Unites;
  @ManyToOne(() => Pannier, (pannier) => pannier.produits, {
    nullable: true,
    onDelete: 'SET NULL',
  }) // Ajout de la relation inverse
  pannier: Pannier;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
