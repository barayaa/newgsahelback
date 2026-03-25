import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Payment } from './entities/payment.entity';
import { Litige } from './entities/litige.entity';
import { Demande } from 'src/MARKET PLACE/demandes/entities/demande.entity';
import { User } from 'src/PROFILE&USER/user/entities/user.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Litige, Demande, User]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
