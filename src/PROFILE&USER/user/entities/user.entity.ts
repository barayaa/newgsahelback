import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Produit } from 'src/MARKET PLACE/produits/entities/produit.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { Pannier } from 'src/MARKET PLACE/pannier/entities/pannier.entity';
import { DataCollecter } from 'src/data_collecter/entities/data_collecter.entity';
import { Profile } from 'src/PROFILE&USER/profiles/entities/profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  telephone: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.ACHETEUR })
  role: Role;

  @OneToMany(() => Produit, (produit) => produit.user)
  produits: Produit[];

  @OneToMany(() => Demande, (demande) => demande.acheteur)
  demandes: Demande[];

  @OneToMany(() => Pannier, (pannier) => pannier.user) // Ajout de la relation inverse
  paniers: Pannier[];

  @OneToMany(() => DataCollecter, (dataCollecter) => dataCollecter.user)
  dataCollecters: DataCollecter[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
