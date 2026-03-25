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
      role: Role.SUPERADMIN,
    });
    await this.seedUser({
      email: 'djibrilsad@gmail.com',
      password: '1234567',
      nom: 'Djibril',
      prenom: 'SAD',
      role: Role.ADMIN,
    });
  }

  private async seedUser(data: { email: string; password: string; nom: string; prenom: string; role: Role }) {
    const exists = await this.userRepo.findOne({ where: { email: data.email } });
    if (exists) {
      this.logger.log(`User ${data.email} already exists — skipping seed`);
      return;
    }
    const salt = await genSalt();
    const hashedPassword = await hash(data.password, salt);
    const user = this.userRepo.create({
      email: data.email,
      password: hashedPassword,
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      isActive: true,
    });
    await this.userRepo.save(user);
    this.logger.log(`Seeded ${data.role}: ${data.email}`);
  }
}
