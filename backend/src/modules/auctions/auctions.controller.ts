import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { AuthGuard } from '@nestjs/passport';
import { AuctionStatus } from '../../database/entities/auction.entity';

@ApiTags('Digital Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  @ApiOperation({ summary: 'List digital property auctions (Live, Upcoming, Closed)' })
  @ApiQuery({ name: 'status', required: false, enum: AuctionStatus })
  async findAll(@Query('status') status?: AuctionStatus) {
    return this.auctionsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction details and bid history' })
  async findOne(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an auction for an approved property listing' })
  async create(@Req() req: any, @Body() body: any) {
    return this.auctionsService.create(req.user, body);
  }

  @Post(':id/bids')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a verified bid in a live digital auction' })
  async placeBid(@Param('id') id: string, @Req() req: any, @Body() body: { amount: number }) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.auctionsService.placeBid(id, req.user, Number(body.amount), String(ip));
  }
}
