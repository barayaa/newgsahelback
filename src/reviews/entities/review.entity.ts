import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  note: number; // 1-5

  @Column({ type: 'text', nullable: true })
  commentaire: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  auteur: User;

  @ManyToOne(() => Produit, { onDelete: 'CASCADE' })
  produit: Produit;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
