import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Produit, (produit) => produit.category)
  produits: Produit[];
}
