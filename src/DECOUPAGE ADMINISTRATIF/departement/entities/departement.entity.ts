import { Commune } from 'src/DECOUPAGE ADMINISTRATIF/commune/entities/commune.entity';
import { Region } from 'src/DECOUPAGE ADMINISTRATIF/region/entities/region.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Departement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @ManyToOne(() => Region, (region) => region.departements, {
    onDelete: 'CASCADE',
  })
  region: Region;

  @OneToMany(() => Commune, (commune) => commune.departement)
  commune: Commune;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
