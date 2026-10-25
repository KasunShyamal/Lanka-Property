import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, KycStatus } from '../database/entities/user.entity';
import { UserGroup } from '../database/entities/user-group.entity';
import { PropertyCategory } from '../database/entities/property-category.entity';
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
    @InjectRepository(UserGroup) private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(PropertyCategory) private readonly categoryRepo: Repository<PropertyCategory>,
    @InjectRepository(Property) private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Auction) private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    @InjectRepository(Inspection) private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(Exchange) private readonly exchangeRepo: Repository<Exchange>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUserGroups();
    await this.seedPropertyCategories();
    await this.seedData();
    await this.seedDiverseProperties();
  }

  async seedUserGroups() {
    const defaultGroups = [
      {
        code: 'BUYER',
        name: 'Buyer',
        description: 'Browse, bid & schedule in-person inspections',
        is_public_registration: true,
        is_system_group: true,
      },
      {
        code: 'SELLER',
        name: 'Seller',
        description: 'List, exchange & auction verified properties',
        is_public_registration: true,
        is_system_group: true,
      },
      {
        code: 'AGENT',
        name: 'Agent',
        description: 'Licensed realtor & brokerage manager',
        is_public_registration: true,
        is_system_group: true,
      },
      {
        code: 'SUPER_ADMIN',
        name: 'Admin',
        description: 'Platform administrator with full governance & master data management',
        is_public_registration: false,
        is_system_group: true,
      },
      {
        code: 'DATA_ENTRY',
        name: 'Data Entry Person',
        description: 'Listing cataloging and property specifications data entry',
        is_public_registration: false,
        is_system_group: false,
      },
      {
        code: 'ACCOUNTANT',
        name: 'Accountant',
        description: 'Auction escrow reconciliation, stamp duty & financial ledger',
        is_public_registration: false,
        is_system_group: false,
      },
    ];

    const groupMap: Record<string, UserGroup> = {};

    for (const item of defaultGroups) {
      let g = await this.groupRepo.findOne({ where: { code: item.code } });
      if (!g) {
        g = this.groupRepo.create(item);
        g = await this.groupRepo.save(g);
        this.logger.log(`Seeded Master Data User Group: ${item.name} (${item.code})`);
      }
      groupMap[item.code] = g;
    }

    // Ensure known seed accounts have their authentic roles and groups assigned
    const adminAccounts = await this.userRepo.find({
      where: [
        { email: 'admin@lankaproperty.lk' },
        { email: 'admin@cargils.com' },
      ],
    });
    for (const a of adminAccounts) {
      if (groupMap['SUPER_ADMIN']) {
        a.role = 'SUPER_ADMIN';
        a.group_id = groupMap['SUPER_ADMIN'].id;
        a.group = groupMap['SUPER_ADMIN'];
        await this.userRepo.save(a);
      }
    }

    const agentAcc = await this.userRepo.findOne({ where: { email: 'agent@premierhomes.lk' } });
    if (agentAcc && groupMap['AGENT']) {
      agentAcc.role = 'AGENT';
      agentAcc.group_id = groupMap['AGENT'].id;
      agentAcc.group = groupMap['AGENT'];
      agentAcc.is_verified_agent = true;
      await this.userRepo.save(agentAcc);
    }

    const sellerAcc = await this.userRepo.findOne({ where: { email: 'malik.fernando@gmail.com' } });
    if (sellerAcc && groupMap['SELLER']) {
      sellerAcc.role = 'SELLER';
      sellerAcc.group_id = groupMap['SELLER'].id;
      sellerAcc.group = groupMap['SELLER'];
      await this.userRepo.save(sellerAcc);
    }

    // Link any remaining users without group_id
    const unlinkedUsers = await this.userRepo.find({ where: { group_id: null as any } });
    for (const u of unlinkedUsers) {
      const matchingGroup = groupMap[u.role] || groupMap['BUYER'];
      if (matchingGroup) {
        u.group_id = matchingGroup.id;
        u.group = matchingGroup;
        await this.userRepo.save(u);
      }
    }

    // Seed sample staff system users (Data Entry & Accountant) if not exists
    const defaultPasswordHash = await bcrypt.hash('Admin@12345', 10);
    const existingDataEntry = await this.userRepo.findOne({ where: { email: 'dataentry@lankaproperty.lk' } });
    if (!existingDataEntry && groupMap['DATA_ENTRY']) {
      const dataEntryUser = this.userRepo.create({
        email: 'dataentry@lankaproperty.lk',
        password_hash: defaultPasswordHash,
        full_name: 'Kamal Data Entry',
        phone: '+94 77 444 5566',
        role: 'DATA_ENTRY',
        group_id: groupMap['DATA_ENTRY'].id,
        group: groupMap['DATA_ENTRY'],
        kyc_status: KycStatus.VERIFIED,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      });
      await this.userRepo.save(dataEntryUser);
      this.logger.log('Seeded sample System User: Kamal Data Entry (dataentry@lankaproperty.lk)');
    }

    const existingAccountant = await this.userRepo.findOne({ where: { email: 'accountant@lankaproperty.lk' } });
    if (!existingAccountant && groupMap['ACCOUNTANT']) {
      const accountantUser = this.userRepo.create({
        email: 'accountant@lankaproperty.lk',
        password_hash: defaultPasswordHash,
        full_name: 'Nimal Accountant',
        phone: '+94 71 555 6677',
        role: 'ACCOUNTANT',
        group_id: groupMap['ACCOUNTANT'].id,
        group: groupMap['ACCOUNTANT'],
        kyc_status: KycStatus.VERIFIED,
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
      });
      await this.userRepo.save(accountantUser);
      this.logger.log('Seeded sample System User: Nimal Accountant (accountant@lankaproperty.lk)');
    }
  }

  async seedPropertyCategories() {
    const defaultCategories = [
      {
        code: 'HOUSE',
        name: 'Houses & Luxury Villas',
        description: 'Single family residences, architectural villas, and bungalows',
        color_code: '#10B981', // Emerald
        icon: 'Home',
        display_order: 1,
      },
      {
        code: 'APARTMENT',
        name: 'Apartments & Penthouses',
        description: 'High-rise luxury apartments, residencies, and penthouses',
        color_code: '#3B82F6', // Royal Blue
        icon: 'Building2',
        display_order: 2,
      },
      {
        code: 'RESIDENTIAL_LAND',
        name: 'Residential Land & Plots',
        description: 'Subdivided prime plots for residential home construction',
        color_code: '#F59E0B', // Amber
        icon: 'Compass',
        display_order: 3,
      },
      {
        code: 'COMMERCIAL',
        name: 'Commercial Properties & Offices',
        description: 'Retail stores, commercial buildings, corporate headquarters, and showrooms',
        color_code: '#8B5CF6', // Purple
        icon: 'Briefcase',
        display_order: 4,
      },
      {
        code: 'COMMERCIAL_LAND',
        name: 'Commercial Lands',
        description: 'High-visibility highway and city frontage lands for commercial ventures',
        color_code: '#F97316', // Orange
        icon: 'Landmark',
        display_order: 5,
      },
      {
        code: 'AGRICULTURAL',
        name: 'Agricultural & Plantations',
        description: 'Tea, rubber, coconut, cinnamon and spice cultivation estates',
        color_code: '#14B8A6', // Teal
        icon: 'Trees',
        display_order: 6,
      },
      {
        code: 'BEACHFRONT',
        name: 'Beachfront & Holiday Properties',
        description: 'Coastal frontage tourist plots, boutique hotels and surf villas',
        color_code: '#06B6D4', // Cyan
        icon: 'Waves',
        display_order: 7,
      },
    ];

    for (const cat of defaultCategories) {
      const existing = await this.categoryRepo.findOne({ where: { code: cat.code } });
      if (!existing) {
        await this.categoryRepo.save(this.categoryRepo.create({ ...cat, is_active: true }));
        this.logger.log(`Created default property category: ${cat.name} (${cat.code}) with color ${cat.color_code}`);
      }
    }

    // Connect any existing properties that don't have category_id set
    const propertiesWithoutCategory = await this.propertyRepo.find({ where: { category_id: null as any } });
    if (propertiesWithoutCategory.length > 0) {
      const allCategories = await this.categoryRepo.find();
      const catMap = new Map(allCategories.map(c => [c.code, c]));
      for (const prop of propertiesWithoutCategory) {
        const targetCat = catMap.get(prop.property_type) || catMap.get('HOUSE');
        if (targetCat) {
          prop.category_id = targetCat.id;
          prop.category = targetCat;
          await this.propertyRepo.save(prop);
        }
      }
      this.logger.log(`Linked ${propertiesWithoutCategory.length} existing properties to master categories`);
    }
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

  async seedDiverseProperties() {
    const allCategories = await this.categoryRepo.find();
    const catMap = new Map(allCategories.map(c => [c.code, c]));

    // 1. Correct existing listings if they were miscategorized as HOUSE
    const existingProperties = await this.propertyRepo.find();
    for (const prop of existingProperties) {
      let targetCode: string | null = null;
      if (prop.title.includes('Ocean View Penthouse')) {
        targetCode = 'APARTMENT';
      } else if (prop.title.includes('Prime 15 Perch Residential Land')) {
        targetCode = 'RESIDENTIAL_LAND';
      } else if (prop.title.includes('Scenic Hillside Estate')) {
        targetCode = 'AGRICULTURAL';
      } else if (prop.title.includes('Colonial Heritage Villa') || prop.title.includes('Cinnamon Gardens')) {
        targetCode = 'HOUSE';
      }

      if (targetCode && catMap.has(targetCode)) {
        const cat = catMap.get(targetCode)!;
        if (prop.category_id !== cat.id || prop.property_type !== targetCode) {
          prop.property_type = targetCode;
          prop.category_id = cat.id;
          prop.category = cat;
          await this.propertyRepo.save(prop);
          this.logger.log(`Re-classified "${prop.title}" -> ${cat.name} (${cat.code})`);
        }
      }
    }

    // 2. Ensure default seller/agent exists to own new seed listings
    const defaultOwner =
      (await this.userRepo.findOne({ where: { email: 'agent@premierhomes.lk' } })) ||
      (await this.userRepo.findOne({ where: { role: UserRole.SUPER_ADMIN } }));

    if (!defaultOwner) return;

    // 3. Insert diverse properties across all categories
    const diverseListings = [
      {
        title: 'Prime 6-Storey Commercial Office Building — Duplication Road Colombo 03',
        slug: 'prime-6-storey-commercial-office-building-colombo-03',
        description: 'Premier freehold corporate building with 12,000 sqft usable floor space. High-speed passenger elevator, 150kVA standby backup generator, dedicated central air-conditioning, basement parking for 10 vehicles, and prime street frontage on Duplication Road Kollupitiya. High rental yield with multinational tenant interest.',
        purpose: PropertyPurpose.SALE,
        property_type: 'COMMERCIAL',
        category_code: 'COMMERCIAL',
        price_lkr: 420000000,
        land_perches: 18.0,
        floor_sqft: 12000,
        price_per_perch: 15000000,
        price_per_sqft: 35000,
        bedrooms: 0,
        bathrooms: 8,
        parking_slots: 10,
        latitude: 6.8992,
        longitude: 79.8540,
        address: 'Duplication Road, Kollupitiya',
        city: 'Colombo 03',
        district: 'Colombo',
        province: 'Western',
        features: ['Elevator / Lift', 'Standby Generator', 'Basement Parking', 'Central AC', '3-Phase Electricity', 'CCTV Security'],
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: false,
        is_featured: true,
        is_urgent: false,
      },
      {
        title: 'Exclusive 120 Perch Golden Beachfront Land — Mirissa South Coast',
        slug: 'exclusive-120-perch-golden-beachfront-land-mirissa',
        description: 'Rare pristine beachfront land parcel with 180 feet of uninterrupted golden sand ocean frontage. Clear deeds with coastal conservation (CCD) clearance and tourist board approval for a luxury boutique hotel or wellness surf resort.',
        purpose: PropertyPurpose.SALE,
        property_type: 'BEACHFRONT',
        category_code: 'BEACHFRONT',
        price_lkr: 360000000,
        land_perches: 120.0,
        floor_sqft: 0,
        price_per_perch: 3000000,
        price_per_sqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        parking_slots: 0,
        latitude: 5.9458,
        longitude: 80.4578,
        address: 'Pelena Beach Road, Mirissa',
        city: 'Mirissa',
        district: 'Matara',
        province: 'Southern',
        features: ['Direct Beach Access', 'Oceanfront Sunset Views', 'CCD Clearance', 'Clear Title Deeds', 'Electricity & Water On-Site'],
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: true,
        exchange_preferences: 'Will consider partial exchange for prime commercial land or property in Colombo.',
        is_featured: true,
        is_urgent: true,
      },
      {
        title: 'Boutique Coastal Surf Villa — Thalpe Beach Galle',
        slug: 'boutique-coastal-surf-villa-thalpe-beach-galle',
        description: 'Idyllic 4-bedroom oceanfront tropical villa situated on the exclusive Thalpe golden mile strip. Features an infinity plunge pool opening onto private reef-protected swimming beach, open-concept living pavilion, and lush coconut grove.',
        purpose: PropertyPurpose.SALE,
        property_type: 'BEACHFRONT',
        category_code: 'BEACHFRONT',
        price_lkr: 210000000,
        land_perches: 28.0,
        floor_sqft: 3800,
        price_per_perch: 7500000,
        price_per_sqft: 55263,
        bedrooms: 4,
        bathrooms: 5,
        parking_slots: 2,
        latitude: 6.0025,
        longitude: 80.2785,
        address: 'Matara Road, Thalpe',
        city: 'Galle',
        district: 'Galle',
        province: 'Southern',
        features: ['Private Beach Access', 'Infinity Pool', 'Ocean Views', 'Fully Furnished', 'Commercial Tourism License'],
        images: [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: false,
        is_featured: true,
        is_urgent: false,
      },
      {
        title: 'High-Visibility 40 Perch Commercial Plot — Baseline Road Colombo 09',
        slug: 'high-visibility-40-perch-commercial-plot-baseline-road',
        description: 'Rectangular commercial land parcel with massive 80-foot road frontage on Baseline Road. Ideal for multinational corporate showroom, automotive hub, or logistics center. 40ft container turning access and CEB heavy industrial power line.',
        purpose: PropertyPurpose.SALE,
        property_type: 'COMMERCIAL_LAND',
        category_code: 'COMMERCIAL_LAND',
        price_lkr: 180000000,
        land_perches: 40.0,
        floor_sqft: 0,
        price_per_perch: 4500000,
        price_per_sqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        parking_slots: 0,
        latitude: 6.9275,
        longitude: 79.8812,
        address: 'Baseline Road, Dematagoda',
        city: 'Colombo 09',
        district: 'Colombo',
        province: 'Western',
        features: ['80ft Main Road Frontage', 'Container Accessible', 'Commercial Zone A', 'Heavy 3-Phase Power', 'Clear Bank Title'],
        images: [
          'https://images.unsplash.com/photo-1524813686514-a57563d77d66?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: false,
        is_featured: false,
        is_urgent: false,
      },
      {
        title: 'Tri-Zen Metro Twin Tower Luxury 2BR — Union Place Colombo 02',
        slug: 'tri-zen-metro-twin-tower-luxury-2br-union-place-colombo-02',
        description: 'Modern smart-home connected 2-bedroom residence in central Colombo 02. Floor-to-ceiling double-glazed windows, European fixtures, dual swimming pools, badminton court, rooftop jogging track, and minutes from Cinnamon Life and CBD.',
        purpose: PropertyPurpose.SALE,
        property_type: 'APARTMENT',
        category_code: 'APARTMENT',
        price_lkr: 68000000,
        land_perches: 0,
        floor_sqft: 1050,
        price_per_perch: 0,
        price_per_sqft: 64761,
        bedrooms: 2,
        bathrooms: 2,
        parking_slots: 1,
        latitude: 6.9215,
        longitude: 79.8590,
        address: 'Union Place, Colombo 02',
        city: 'Colombo 02',
        district: 'Colombo',
        province: 'Western',
        features: ['City Skyline Views', 'Smart Home System', 'Rooftop Pools', 'Gym & Clubhouse', '24h Concierge', 'Backup Power'],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: true,
        exchange_preferences: 'Open to exchange for residential land in Battaramulla or Thalawathugoda with cash adjustment.',
        is_featured: false,
        is_urgent: true,
      },
      {
        title: '25-Acre Mature Export Tea & Cinnamon Estate — Elpitiya Galle',
        slug: '25-acre-mature-export-tea-cinnamon-estate-elpitiya',
        description: 'High-yielding agro-estate with 15 acres of mature VP tea and 10 acres of export-grade Ceylon cinnamon. Natural mountain stream, spring water wells, factory processing shed, internal gravel vehicle roads, and colonial planter bungalow.',
        purpose: PropertyPurpose.SALE,
        property_type: 'AGRICULTURAL',
        category_code: 'AGRICULTURAL',
        price_lkr: 115000000,
        land_perches: 4000.0,
        floor_sqft: 3200,
        price_per_perch: 28750,
        price_per_sqft: 35937,
        bedrooms: 3,
        bathrooms: 2,
        parking_slots: 4,
        latitude: 6.2550,
        longitude: 80.1420,
        address: 'Kahaduwa Road, Elpitiya',
        city: 'Galle',
        district: 'Galle',
        province: 'Southern',
        features: ['Yielding Tea Crop', 'Export Cinnamon', 'Water Springs & Stream', 'Planter Bungalow', 'Motorable Internal Roads'],
        images: [
          'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=1200',
          'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: false,
        is_featured: false,
        is_urgent: false,
      },
      {
        title: 'Panoramic Hilltop Residential Land 20 Perches — Heerassagala Kandy',
        slug: 'panoramic-hilltop-residential-land-20-perches-heerassagala-kandy',
        description: 'Elevated highland building block with breathtaking 180-degree amphitheater views of the Hantana mountain range and Kandy valley. Engineered stone retaining walls already constructed. 20ft carpeted access road from Heerassagala junction.',
        purpose: PropertyPurpose.SALE,
        property_type: 'RESIDENTIAL_LAND',
        category_code: 'RESIDENTIAL_LAND',
        price_lkr: 38000000,
        land_perches: 20.0,
        floor_sqft: 0,
        price_per_perch: 1900000,
        price_per_sqft: 0,
        bedrooms: 0,
        bathrooms: 0,
        parking_slots: 0,
        latitude: 7.2705,
        longitude: 80.6120,
        address: 'Heerassagala Road, Kandy',
        city: 'Kandy',
        district: 'Kandy',
        province: 'Central',
        features: ['Panoramic Mountain Views', 'Retaining Walls Built', '20ft Carpeted Access', 'CEB Electricity & Water', 'Clear Title Deeds'],
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
        ],
        status: PropertyStatus.APPROVED,
        is_exchange_eligible: false,
        is_featured: false,
        is_urgent: false,
      },
    ];

    for (const item of diverseListings) {
      const existing = await this.propertyRepo.findOne({ where: { slug: item.slug } });
      if (!existing) {
        const cat = catMap.get(item.category_code);
        const { category_code, ...propData } = item;
        const newProp = this.propertyRepo.create({
          ...propData,
          category_id: cat ? cat.id : undefined,
          category: cat,
          owner: defaultOwner,
        });
        await this.propertyRepo.save(newProp);
        this.logger.log(`Seeded diverse property listing: ${item.title} (${item.property_type})`);
      }
    }
  }
}
