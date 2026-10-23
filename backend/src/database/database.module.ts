import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Property } from './entities/property.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { Inspection } from './entities/inspection.entity';
import { Exchange } from './entities/exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const dbUrl = process.env.DATABASE_URL;
        return {
          type: 'postgres',
          ...(dbUrl
            ? {
                url: dbUrl,
                ssl: { rejectUnauthorized: false },
              }
            : {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USER || 'lankaproperty_admin',
                password: process.env.DB_PASSWORD || 'lankaproperty_secret_pass',
                database: process.env.DB_NAME || 'lankaproperty_db',
              }),
          entities: [User, Property, Auction, Bid, Inspection, Exchange],
          synchronize: true, // Auto-sync schema in development & free staging
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature([User, Property, Auction, Bid, Inspection, Exchange]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
