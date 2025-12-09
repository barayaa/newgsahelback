import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MagasinProduit } from './magasin_produit.entity';

@Entity()
export class Magasin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Localite, (localite) => localite.magasins, {
    nullable: false,
  })
  localite: Localite;

  @OneToMany(() => MagasinProduit, (magasinProduit) => magasinProduit.magasin)
  magasinProduits: MagasinProduit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
