import { DataCollecter } from 'src/data_collecter/entities/data_collecter.entity';
import { Commune } from 'src/DECOUPAGE ADMINISTRATIF/commune/entities/commune.entity';
import { Magasin } from 'src/DECOUPAGE ADMINISTRATIF/magasin/entities/magasin.entity';
import { Marcher } from 'src/DECOUPAGE ADMINISTRATIF/marcher/entities/marcher.entity';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
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
export class Localite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @ManyToOne(() => Commune, (commune) => commune.localites)
  commune: Commune;

  @OneToMany(() => Produit, (produit) => produit.localite)
  produits: Produit[];

  @OneToMany(() => Magasin, (magasin) => magasin.localite)
  magasins: Magasin[];

  @OneToMany(() => Marcher, (marcher) => marcher.localite)
  marcher: Marcher[];

  @OneToMany(() => DataCollecter, (dataCollecter) => dataCollecter.localite)
  dataCollecters: DataCollecter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
