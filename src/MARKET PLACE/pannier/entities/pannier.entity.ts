import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pannier {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.paniers, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Produit, (produit) => produit.pannier, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  produits: Produit[];
}
