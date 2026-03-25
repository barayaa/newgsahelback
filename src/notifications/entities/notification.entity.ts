import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum NotificationType {
  DEMANDE_RECUE = 'DEMANDE_RECUE',
  DEMANDE_VALIDEE = 'DEMANDE_VALIDEE',
  DEMANDE_REJETEE = 'DEMANDE_REJETEE',
  NOUVEAU_PRODUIT = 'NOUVEAU_PRODUIT',
  STOCK_BAS = 'STOCK_BAS',
  NOUVEAU_AVIS = 'NOUVEAU_AVIS',
  SYSTEME = 'SYSTEME',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEME })
  type: NotificationType;

  @Column({ default: false })
  lue: boolean;

  @Column({ nullable: true })
  lienId: number; // id de la demande ou du produit concerné

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  destinataire: User;

  @CreateDateColumn()
  createdAt: Date;
}
