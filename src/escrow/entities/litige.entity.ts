import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Column, CreateDateColumn, Entity, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

export enum StatutLitige {
  OUVERT           = 'OUVERT',
  EN_COURS         = 'EN_COURS',
  RESOLU_ACHETEUR  = 'RESOLU_ACHETEUR',
  RESOLU_VENDEUR   = 'RESOLU_VENDEUR',
}

@Entity()
export class Litige {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  raison: string;

  @Column({ type: 'text', nullable: true })
  preuves: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'enum', enum: StatutLitige, default: StatutLitige.OUVERT })
  statut: StatutLitige;

  @ManyToOne(() => Payment, (p) => p.litiges, { onDelete: 'CASCADE' })
  payment: Payment;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  ouvertPar: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  resoluPar: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
