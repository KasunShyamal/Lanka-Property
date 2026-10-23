import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { AdminModule } from './modules/admin/admin.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    DatabaseModule,
    AuthModule,
    PropertiesModule,
    AuctionsModule,
    InspectionsModule,
    ExchangesModule,
    AdminModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
