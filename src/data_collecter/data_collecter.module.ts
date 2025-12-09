import { Module } from '@nestjs/common';
import { DataCollecterService } from './data_collecter.service';
import { DataCollecterController } from './data_collecter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataCollecter } from './entities/data_collecter.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { Localite } from 'src/DECOUPAGE ADMINISTRATIF/localite/entities/localite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DataCollecter, User, Localite])],
  controllers: [DataCollecterController],
  providers: [DataCollecterService],
})
export class DataCollecterModule {}
