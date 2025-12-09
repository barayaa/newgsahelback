import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  ville: string;

  @Column({ nullable: true })
  codePostal: string;

  @Column({ nullable: true })
  pays: string;

  @Column({ nullable: true })
  dateNaissance: Date;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
