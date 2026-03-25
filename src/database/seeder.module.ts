import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SeederService],
})
export class SeederModule {}
