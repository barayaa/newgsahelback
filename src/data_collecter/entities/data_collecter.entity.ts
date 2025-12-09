import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class DataCollecter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.dataCollecters, { eager: true })
  user: User;

  @ManyToOne(() => Localite, (localite) => localite.dataCollecters)
  localite: Localite;

  @Column()
  fileName: string;

  @Column({ nullable: true })
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
