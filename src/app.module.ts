import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './PROFILE&USER/user/user.module';
import { ProduitsModule } from './MARKET PLACE/produits/produits.module';
import { DemandesModule } from './MARKET PLACE/demandes/demandes.module';
import { DataCollecterModule } from './data_collecter/data_collecter.module';
import { MarcherModule } from './DECOUPAGE ADMINISTRATIF/marcher/marcher.module';
import { MagasinModule } from './DECOUPAGE ADMINISTRATIF/magasin/magasin.module';
import { LocaliteModule } from './DECOUPAGE ADMINISTRATIF/localite/localite.module';
import { CommuneModule } from './DECOUPAGE ADMINISTRATIF/commune/commune.module';
import { DepartementModule } from './DECOUPAGE ADMINISTRATIF/departement/departement.module';
import { RegionModule } from './DECOUPAGE ADMINISTRATIF/region/region.module';
import { CategoriesModule } from './MARKET PLACE/categories/categories.module';
import { MailModule } from './MAIL&NOTIF/mail.module';
import { PannierModule } from './MARKET PLACE/pannier/pannier.module';
import { UniteModule } from './MARKET PLACE/unite/unite.module';
import { StatsModule } from './stats/stats.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PriceHistoryModule } from './price-history/price-history.module';
import { HealthModule } from './health/health.module';
import { EscrowModule } from './escrow/escrow.module';
import { CartographieModule } from './cartographie/cartographie.module';
import { SeederModule } from './database/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    AuthModule,
    UserModule,
    ProduitsModule,
    DemandesModule,
    DataCollecterModule,
    MarcherModule,
    LocaliteModule,
    DepartementModule,
    RegionModule,
    CommuneModule,
    CategoriesModule,
    MagasinModule,
    MailModule,
    PannierModule,
    UniteModule,
    StatsModule,
    ReviewsModule,
    FavoritesModule,
    NotificationsModule,
    PriceHistoryModule,
    HealthModule,
    EscrowModule,
    CartographieModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
