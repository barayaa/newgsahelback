import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Marcher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({
    nullable: true,
  })
  typeMarcher: string;

  @Column({
    type: 'decimal',
  })
  latitude: number;

  @Column({
    type: 'decimal',
  })
  longitude: number;

  @Column()
  jour_annimation: string;

  @ManyToOne(() => Localite, (localite) => localite.marcher)
  localite: Localite;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
