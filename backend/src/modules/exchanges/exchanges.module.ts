import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from '../../database/entities/exchange.entity';
import { Property } from '../../database/entities/property.entity';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, Property])],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
