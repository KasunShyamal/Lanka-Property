import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../../database/entities/auction.entity';
import { Bid } from '../../database/entities/bid.entity';
import { Property } from '../../database/entities/property.entity';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionsGateway } from './auctions.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid, Property])],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService, AuctionsGateway],
})
export class AuctionsModule {}
