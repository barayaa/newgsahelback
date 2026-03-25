import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  prix: number;

  @ManyToOne(() => Produit, { onDelete: 'CASCADE' })
  produit: Produit;

  @CreateDateColumn()
  enregistreA: Date;
}
