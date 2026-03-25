import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Role } from 'src/PROFILE&USER/user/enums/role.enum';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUser({
      email: 'barayaawahab@gmail.com',
      password: 'grenierSahel@2028',
      nom: 'Baraya',
      prenom: 'Wahab',
      telephone: '+22700000001',
      role: Role.SUPERADMIN,
    });
    await this.seedUser({
      email: 'djibrilsad@gmail.com',
      password: '1234567',
      nom: 'Djibril',
      prenom: 'SAD',
      telephone: '+22700000002',
      role: Role.ADMIN,
    });
  }

  private async seedUser(data: { email: string; password: string; nom: string; prenom: string; telephone: string; role: Role }) {
    const salt = await genSalt();
    const hashedPassword = await hash(data.password, salt);

    const exists = await this.userRepo.findOne({ where: { email: data.email } });
    if (exists) {
      // Mettre à jour le rôle et le mot de passe si l'utilisateur existe déjà
      await this.userRepo.update(exists.id, {
        role: data.role,
        password: hashedPassword,
        isActive: true,
      });
      this.logger.log(`Updated ${data.role}: ${data.email}`);
      return;
    }

    const user = this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      role: data.role,
      isActive: true,
    });
    await this.userRepo.save(user);
    this.logger.log(`Seeded ${data.role}: ${data.email}`);
  }
}
