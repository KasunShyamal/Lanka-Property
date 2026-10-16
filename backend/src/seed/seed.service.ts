import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, KycStatus } from '../database/entities/user.entity';
import { Property, PropertyPurpose, PropertyType, PropertyStatus } from '../database/entities/property.entity';
import { Auction, AuctionStatus } from '../database/entities/auction.entity';
import { Bid, BidStatus } from '../database/entities/bid.entity';
import { Inspection, InspectionStatus } from '../database/entities/inspection.entity';
import { Exchange, ExchangeStatus } from '../database/entities/exchange.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Property) private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Auction) private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Inspection) private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(Exchange) private readonly exchangeRepo: Repository<Exchange>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedData();
  }

  async seedData() {
    const existingUsers = await this.userRepo.count();
    if (existingUsers > 0) {
      this.logger.log('Database already seeded. Skipping initial seeding.');
      return;
    }

    this.logger.log('Seeding initial Sri Lanka real estate platform data...');

    const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);

    // 1. Seed Users
    const adminUser = this.userRepo.create({
      email: 'admin@lankaproperty.lk',
      password_hash: defaultPasswordHash,
      full_name: 'Dinesh Wickramasinghe',
      phone: '+94 77 123 4567',
      role: UserRole.SUPER_ADMIN,
      kyc_status: KycStatus.VERIFIED,
      nic_passport_no: '198412345678',
      is_verified_agent: true,
      agency_name: 'LankaProperty HQ Moderation',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    });

    const agentUser = this.userRepo.create({
      email: 'agent@premierhomes.lk',
      password_hash: defaultPasswordHash,
      full_name: 'Shanuka Perera',
      phone: '+94 71 888 9999',
      role: UserRole.AGENT,
      kyc_status: KycStatus.VERIFIED,
      nic_passport_no: '199023456789',
      is_verified_agent: true,
      agency_name: 'Premier Island Realtors Colombo',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    });

    const sellerA = this.userRepo.create({
      email: 'malik.fernando@gmail.com',
      password_hash: defaultPasswordHash,
      full_name: 'Malik Fernando',
      phone: '+94 76 555 4321',
      role: UserRole.SELLER,
      kyc_status: KycStatus.VERIFIED,
      nic_passport_no: '197898765432',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    });

    const sellerB = this.userRepo.create({
      email: 'chamari.senanayake@yahoo.com',
      password_hash: defaultPasswordHash,
      full_name: 'Chamari Senanayake',
      phone: '+94 72 333 2211',
      role: UserRole.SELLER,
      kyc_status: KycStatus.VERIFIED,
      nic_passport_no: '198965432109',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    });

    const buyerUser = this.userRepo.create({
      email: 'rohan.de.silva@outlook.com',
      password_hash: defaultPasswordHash,
      full_name: 'Rohan De Silva',
      phone: '+94 77 999 1122',
      role: UserRole.BUYER,
      kyc_status: KycStatus.VERIFIED,
      nic_passport_no: '199511223344',
      avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
    });

    await this.userRepo.save([adminUser, agentUser, sellerA, sellerB, buyerUser]);

    // 2. Seed Realistic Sri Lankan Properties
    const prop1 = this.propertyRepo.create({
      title: 'Luxury 4BR Contemporary Villa in Cinnamon Gardens',
      slug: 'luxury-4br-contemporary-villa-cinnamon-gardens-colombo-7',
      description: 'Architect-designed tropical modern villa situated in prime Colombo 07. Features double-height living areas, private salt-water lap pool, teak timber finishes, solar power array with Tesla Powerwall battery backup, servant quarters, and 3-phase electricity. Clear deeds with bank-verified titles.',
      purpose: PropertyPurpose.SALE,
      property_type: PropertyType.LUXURY_VILLA,
      price_lkr: 185000000,
      land_perches: 18.5,
      floor_sqft: 4800,
      price_per_perch: 10000000,
      price_per_sqft: 38541,
      bedrooms: 4,
      bathrooms: 5,
      parking_slots: 3,
      latitude: 6.9065,
      longitude: 79.8708,
      address: 'Ward Place, Colombo 07',
      city: 'Colombo 07',
      district: 'Colombo',
      province: 'Western',
      features: ['Swimming Pool', 'Solar Electricity', 'Maids Quarters', '24h Security', 'Air Conditioning', 'Roof Terrace'],
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200',
      ],
      status: PropertyStatus.APPROVED,
      is_exchange_eligible: true,
      exchange_preferences: 'Open to partial exchange for prime beachfront land in Southern Province (Galle or Mirissa) with cash balance.',
      is_featured: true,
      is_urgent: false,
      owner: sellerA,
    });

    const prop2 = this.propertyRepo.create({
      title: 'Ocean View Penthouse — Galle Face Colombo 03',
      slug: 'ocean-view-penthouse-galle-face-colombo-03',
      description: 'High-floor corner penthouse offering 270-degree panoramic vistas of the Indian Ocean and Colombo Port City. Direct private lift access, Italian fitted designer kitchen, smart-home automated lighting, and club access.',
      purpose: PropertyPurpose.SALE,
      property_type: PropertyType.APARTMENT,
      price_lkr: 145000000,
      land_perches: 0,
      floor_sqft: 3200,
      price_per_perch: 0,
      price_per_sqft: 45312,
      bedrooms: 3,
      bathrooms: 4,
      parking_slots: 2,
      latitude: 6.9182,
      longitude: 79.8488,
      address: 'Galle Road, Kollupitiya, Colombo 03',
      city: 'Colombo 03',
      district: 'Colombo',
      province: 'Western',
      features: ['Ocean View', 'Infinity Pool', 'Gym & Spa', 'Port City View', 'Concierge Service', 'Generator Backup'],
      images: [
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
      ],
      status: PropertyStatus.APPROVED,
      is_exchange_eligible: false,
      is_featured: true,
      is_urgent: true,
      owner: agentUser,
    });

    const prop3 = this.propertyRepo.create({
      title: 'Colonial Heritage Villa overlooking Galle Fort Ramparts',
      slug: 'colonial-heritage-villa-galle-fort-ramparts',
      description: 'Rare opportunity inside the UNESCO World Heritage Galle Fort. Restored 18th-century Dutch architectural manor with antique arches, central courtyard, and lush tropical frangipani garden. Operating as boutique luxury villa.',
      purpose: PropertyPurpose.SALE,
      property_type: PropertyType.LUXURY_VILLA,
      price_lkr: 260000000,
      land_perches: 22.0,
      floor_sqft: 5200,
      price_per_perch: 11818181,
      price_per_sqft: 50000,
      bedrooms: 5,
      bathrooms: 6,
      parking_slots: 2,
      latitude: 6.0329,
      longitude: 80.2168,
      address: 'Lighthouse Street, Galle Fort',
      city: 'Galle Fort',
      district: 'Galle',
      province: 'Southern',
      features: ['Historic Architecture', 'Courtyard Garden', 'Commercial Potential', 'Minutes to Beach', 'Fully Furnished'],
      images: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200',
      ],
      status: PropertyStatus.APPROVED,
      is_exchange_eligible: true,
      exchange_preferences: 'Will consider exchange for commercial property or land in Colombo 03 or 07.',
      is_featured: true,
      is_urgent: false,
      owner: sellerB,
    });

    const prop4 = this.propertyRepo.create({
      title: 'Prime 15 Perch Residential Land — Nawala Rajagiriya',
      slug: 'prime-15-perch-residential-land-nawala-rajagiriya',
      description: 'Solid rectangular highland plot in premier residential zone. 20ft wide carpeted private access road, 300m from Nawala road junction. Waterboard and CEB 3-phase connections available. Clear title deeds ready for immediate deed transfer.',
      purpose: PropertyPurpose.SALE,
      property_type: PropertyType.RESIDENTIAL_LAND,
      price_lkr: 52500000,
      land_perches: 15.0,
      floor_sqft: 0,
      price_per_perch: 3500000,
      price_per_sqft: 0,
      bedrooms: 0,
      bathrooms: 0,
      parking_slots: 0,
      latitude: 6.8912,
      longitude: 79.8894,
      address: 'School Lane, Nawala',
      city: 'Rajagiriya',
      district: 'Colombo',
      province: 'Western',
      features: ['20ft Wide Road', 'Pipe Water', '3-Phase Electricity', 'Highland Solid Ground', 'Clear Deeds'],
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
      ],
      status: PropertyStatus.APPROVED,
      is_exchange_eligible: true,
      exchange_preferences: 'Looking for 3-bedroom apartment in Colombo suburbs (Battaramulla, Talawatugoda).',
      is_featured: false,
      is_urgent: false,
      owner: sellerA,
    });

    const prop5 = this.propertyRepo.create({
      title: 'Scenic Hillside Estate & Bungalow — Hantana Kandy',
      slug: 'scenic-hillside-estate-bungalow-hantana-kandy',
      description: 'Surrounded by misty mountain tea gardens in Hantana range. Serene colonial planter bungalow with wrap-around verandah, 4 en-suite bedrooms, spring-fed natural water, and 2 acres of tea and pepper.',
      purpose: PropertyPurpose.SALE,
      property_type: PropertyType.AGRICULTURAL,
      price_lkr: 98000000,
      land_perches: 320.0,
      floor_sqft: 3600,
      price_per_perch: 306250,
      price_per_sqft: 27222,
      bedrooms: 4,
      bathrooms: 4,
      parking_slots: 4,
      latitude: 7.2721,
      longitude: 80.6288,
      address: 'Hantana Estate Road, Kandy',
      city: 'Kandy',
      district: 'Kandy',
      province: 'Central',
      features: ['Mountain Views', 'Natural Water Spring', 'Tea Plantation', 'Eco-Tourism Potential', 'Verandah'],
      images: [
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
      ],
      status: PropertyStatus.APPROVED,
      is_exchange_eligible: false,
      is_featured: false,
      is_urgent: false,
      owner: sellerB,
    });

    await this.propertyRepo.save([prop1, prop2, prop3, prop4, prop5]);

    // 3. Seed Live Digital Auction
    const now = new Date();
    const liveAuction = this.auctionRepo.create({
      property: prop1,
      seller: sellerA,
      starting_bid: 150000000,
      reserve_price: 175000000, // Confidential reserve
      current_highest_bid: 168000000,
      highest_bidder: buyerUser,
      bid_increment: 2000000,
      starts_at: new Date(now.getTime() - 2 * 3600 * 1000), // Started 2h ago
      ends_at: new Date(now.getTime() + 48 * 3600 * 1000), // Ends in 48 hours
      status: AuctionStatus.LIVE,
      soft_close_enabled: true,
      soft_close_seconds: 120,
      total_bids_count: 5,
    });

    const upcomingAuction = this.auctionRepo.create({
      property: prop3,
      seller: sellerB,
      starting_bid: 220000000,
      reserve_price: 250000000,
      current_highest_bid: 220000000,
      bid_increment: 5000000,
      starts_at: new Date(now.getTime() + 72 * 3600 * 1000), // Starts in 3 days
      ends_at: new Date(now.getTime() + 120 * 3600 * 1000),
      status: AuctionStatus.APPROVED,
      soft_close_enabled: true,
      soft_close_seconds: 120,
      total_bids_count: 0,
    });

    await this.auctionRepo.save([liveAuction, upcomingAuction]);

    // 4. Seed Bids for Live Auction
    const bid1 = this.bidRepo.create({
      auction: liveAuction,
      bidder: buyerUser,
      amount: 155000000,
      status: BidStatus.OUTBID,
      ip_address: '124.43.90.12',
    });
    const bid2 = this.bidRepo.create({
      auction: liveAuction,
      bidder: adminUser,
      amount: 160000000,
      status: BidStatus.OUTBID,
      ip_address: '112.134.12.44',
    });
    const bid3 = this.bidRepo.create({
      auction: liveAuction,
      bidder: buyerUser,
      amount: 168000000,
      status: BidStatus.WINNING,
      ip_address: '124.43.90.12',
    });
    await this.bidRepo.save([bid1, bid2, bid3]);

    // 5. Seed In-Person Inspection Request
    const inspection1 = this.inspectionRepo.create({
      property: prop1,
      buyer: buyerUser,
      seller: sellerA,
      scheduled_at: new Date(now.getTime() + 24 * 3600 * 1000), // Tomorrow
      buyer_notes: 'Interested in structural inspection and checking title deed copies with our family lawyer.',
      seller_feedback: 'Confirmed. Security has been notified. Parking slot reserved at premises.',
      status: InspectionStatus.CONFIRMED,
    });
    await this.inspectionRepo.save(inspection1);

    // 6. Seed Property Exchange Proposal
    const exchange1 = this.exchangeRepo.create({
      offered_property: prop4, // Nawala Land (52.5M)
      target_property: prop1,  // Cinnamon Gardens Villa (185M)
      proposer: sellerA,
      target_owner: sellerA,
      cash_adjustment_lkr: 130000000, // Offered property + 130M cash
      proposal_notes: 'Proposing swap of Nawala prime land + LKR 130M cash differential for the Cinnamon Gardens villa.',
      status: ExchangeStatus.UNDER_REVIEW,
    });
    await this.exchangeRepo.save(exchange1);

    this.logger.log('Sri Lanka real estate platform seed completed successfully.');
  }
}
