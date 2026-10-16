import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction, AuctionStatus } from '../../database/entities/auction.entity';
import { Bid, BidStatus } from '../../database/entities/bid.entity';
import { Property, PropertyStatus } from '../../database/entities/property.entity';
import { User } from '../../database/entities/user.entity';
import { AuctionsGateway } from './auctions.gateway';

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    private readonly gateway: AuctionsGateway,
  ) {}

  async findAll(status?: AuctionStatus) {
    const qb = this.auctionRepo
      .createQueryBuilder('auction')
      .leftJoinAndSelect('auction.property', 'property')
      .leftJoinAndSelect('auction.seller', 'seller')
      .leftJoinAndSelect('auction.highest_bidder', 'highest_bidder');

    if (status) {
      qb.where('auction.status = :status', { status });
    }

    qb.orderBy('auction.ends_at', 'ASC');

    const auctions = await qb.getMany();

    // Mask confidential reserve price and include reserve_met indicator
    return auctions.map((auction) => this.sanitizeAuction(auction));
  }

  async findOne(id: string) {
    const auction = await this.auctionRepo.findOne({
      where: { id },
      relations: ['property', 'seller', 'highest_bidder', 'bids', 'bids.bidder'],
    });

    if (!auction) {
      throw new NotFoundException(`Auction with ID '${id}' not found`);
    }

    if (auction.bids) {
      auction.bids.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    return this.sanitizeAuction(auction);
  }

  async create(user: User, data: any) {
    const property = await this.propertyRepo.findOne({
      where: { id: data.property_id },
      relations: ['owner'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.owner.id !== user.id) {
      throw new ForbiddenException('You can only create an auction for a property you own');
    }

    const starting_bid = Number(data.starting_bid);
    const reserve_price = Number(data.reserve_price);
    const bid_increment = Number(data.bid_increment || 100000);

    const auction = this.auctionRepo.create({
      property,
      seller: user,
      starting_bid,
      reserve_price,
      current_highest_bid: starting_bid,
      bid_increment,
      starts_at: new Date(data.starts_at),
      ends_at: new Date(data.ends_at),
      status: AuctionStatus.PENDING,
      soft_close_enabled: data.soft_close_enabled !== false,
      soft_close_seconds: data.soft_close_seconds || 120,
    });

    return this.auctionRepo.save(auction);
  }

  async placeBid(auctionId: string, bidder: User, amount: number, ipAddress?: string) {
    const auction = await this.auctionRepo.findOne({
      where: { id: auctionId },
      relations: ['property', 'seller', 'highest_bidder'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const now = new Date();
    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException(`Cannot place bid. Auction status is ${auction.status}`);
    }

    if (now > new Date(auction.ends_at)) {
      auction.status =
        Number(auction.current_highest_bid) >= Number(auction.reserve_price)
          ? AuctionStatus.CLOSED_RESERVE_MET
          : AuctionStatus.CLOSED_RESERVE_NOT_MET;
      await this.auctionRepo.save(auction);
      throw new BadRequestException('Auction has ended');
    }

    if (auction.seller.id === bidder.id) {
      throw new BadRequestException('Sellers cannot bid on their own auctions (shill bidding prohibited)');
    }

    const minRequiredBid = Number(auction.current_highest_bid) + Number(auction.bid_increment);
    if (amount < minRequiredBid) {
      throw new BadRequestException(
        `Bid must be at least LKR ${minRequiredBid.toLocaleString()} (current bid + increment)`,
      );
    }

    // Atomic bid update
    auction.current_highest_bid = amount;
    auction.highest_bidder = bidder;
    auction.total_bids_count += 1;

    // Soft-close anti-sniping rule: if bid placed in final 120s, extend auction by 120s
    let extended = false;
    const remainingSeconds = (new Date(auction.ends_at).getTime() - now.getTime()) / 1000;
    if (auction.soft_close_enabled && remainingSeconds <= auction.soft_close_seconds) {
      auction.ends_at = new Date(now.getTime() + auction.soft_close_seconds * 1000);
      extended = true;
    }

    await this.auctionRepo.save(auction);

    const bid = this.bidRepo.create({
      auction,
      bidder,
      amount,
      status: BidStatus.WINNING,
      ip_address: ipAddress || '127.0.0.1',
    });
    await this.bidRepo.save(bid);

    // Broadcast live WebSocket event to all viewing buyers
    this.gateway.broadcastNewBid(auction.id, {
      bid_id: bid.id,
      amount,
      bidder_name: bidder.full_name,
      ends_at: auction.ends_at,
      soft_close_extended: extended,
      reserve_met: Number(amount) >= Number(auction.reserve_price),
      created_at: bid.created_at,
    });

    return {
      success: true,
      auction: this.sanitizeAuction(auction),
      bid: {
        id: bid.id,
        amount: bid.amount,
        created_at: bid.created_at,
      },
    };
  }

  private sanitizeAuction(auction: Auction) {
    const is_reserve_met = Number(auction.current_highest_bid) >= Number(auction.reserve_price);
    const { reserve_price, ...safeAuction } = auction as any;
    return {
      ...safeAuction,
      is_reserve_met,
    };
  }
}
