import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from '../../database/entities/property.entity';
import { Auction, AuctionStatus } from '../../database/entities/auction.entity';
import { User, UserRole, KycStatus } from '../../database/entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Auction)
    private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getDashboardStats() {
    const totalProperties = await this.propertyRepo.count();
    const pendingProperties = await this.propertyRepo.count({ where: { status: PropertyStatus.PENDING } });
    const liveAuctions = await this.auctionRepo.count({ where: { status: AuctionStatus.LIVE } });
    const totalUsers = await this.userRepo.count();
    const verifiedAgents = await this.userRepo.count({ where: { is_verified_agent: true } });

    return {
      totalProperties,
      pendingProperties,
      liveAuctions,
      totalUsers,
      verifiedAgents,
    };
  }

  async getPendingProperties() {
    return this.propertyRepo.find({
      where: { status: PropertyStatus.PENDING },
      relations: ['owner'],
      order: { created_at: 'DESC' },
    });
  }

  async approveProperty(id: string) {
    const prop = await this.propertyRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException('Property not found');
    prop.status = PropertyStatus.APPROVED;
    return this.propertyRepo.save(prop);
  }

  async rejectProperty(id: string) {
    const prop = await this.propertyRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException('Property not found');
    prop.status = PropertyStatus.REJECTED;
    return this.propertyRepo.save(prop);
  }

  async getPendingAuctions() {
    return this.auctionRepo.find({
      where: { status: AuctionStatus.PENDING },
      relations: ['property', 'seller'],
      order: { created_at: 'DESC' },
    });
  }

  async approveAuction(id: string) {
    const auction = await this.auctionRepo.findOne({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    const now = new Date();
    if (now >= new Date(auction.starts_at) && now < new Date(auction.ends_at)) {
      auction.status = AuctionStatus.LIVE;
    } else {
      auction.status = AuctionStatus.APPROVED;
    }
    return this.auctionRepo.save(auction);
  }

  async verifyAgent(userId: string, is_verified: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.is_verified_agent = is_verified;
    if (is_verified) {
      user.role = UserRole.AGENT;
      user.kyc_status = KycStatus.VERIFIED;
    }
    return this.userRepo.save(user);
  }
}
