import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Auction } from './auction.entity';
import { Inspection } from './inspection.entity';

export enum PropertyPurpose {
  SALE = 'SALE',
  RENT = 'RENT',
}

export enum PropertyType {
  HOUSE = 'HOUSE',
  LUXURY_VILLA = 'LUXURY_VILLA',
  APARTMENT = 'APARTMENT',
  COMMERCIAL = 'COMMERCIAL',
  RESIDENTIAL_LAND = 'RESIDENTIAL_LAND',
  COMMERCIAL_LAND = 'COMMERCIAL_LAND',
  AGRICULTURAL = 'AGRICULTURAL',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: PropertyPurpose, default: PropertyPurpose.SALE })
  purpose: PropertyPurpose;

  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.HOUSE })
  property_type: PropertyType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price_lkr: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  land_perches: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  floor_sqft: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price_per_perch: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  price_per_sqft: number;

  @Column({ type: 'int', default: 0 })
  bedrooms: number;

  @Column({ type: 'int', default: 0 })
  bathrooms: number;

  @Column({ type: 'int', default: 0 })
  parking_slots: number;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column({ default: 'Western' })
  province: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column({ type: 'jsonb', default: [] })
  features: string[];

  @Column({ type: 'enum', enum: PropertyStatus, default: PropertyStatus.PENDING })
  status: PropertyStatus;

  @Column({ default: false })
  is_exchange_eligible: boolean;

  @Column({ type: 'text', nullable: true })
  exchange_preferences: string;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: false })
  is_urgent: boolean;

  @ManyToOne(() => User, (user) => user.properties, { eager: true, onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Auction, (auction) => auction.property)
  auctions: Auction[];

  @OneToMany(() => Inspection, (inspection) => inspection.property)
  inspections: Inspection[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
