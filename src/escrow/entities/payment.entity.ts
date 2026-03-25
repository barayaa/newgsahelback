import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Column, CreateDateColumn, Entity, ManyToOne,
  OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Litige } from './litige.entity';

export enum PaymentStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  TENU      = 'TENU',
  LIBERE    = 'LIBERE',
  REMBOURSE = 'REMBOURSE',
  ECHEC     = 'ECHEC',
  LITIGE    = 'LITIGE',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  montant: number;

  @Column('decimal', { precision: 12, scale: 2 })
  commission: number;

  @Column('decimal', { precision: 12, scale: 2 })
  montantVendeur: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.EN_ATTENTE })
  statut: PaymentStatus;

  @Column({ nullable: true })
  telephoneAcheteur: string;

  @Column({ nullable: true })
  telephoneVendeur: string;

  @Column({ nullable: true })
  cinetpayPayId: string;

  @Column({ nullable: true })
  cinetpayOperateur: string;

  @Column({ type: 'timestamp', nullable: true })
  autoReleaseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  libereLe: Date;

  @ManyToOne(() => Demande, { onDelete: 'SET NULL', nullable: true })
  demande: Demande;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  acheteur: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  vendeur: User;

  @OneToMany(() => Litige, (l) => l.payment)
  litiges: Litige[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
