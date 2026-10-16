import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from './property.entity';
import { Bid } from './bid.entity';
import { Inspection } from './inspection.entity';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
  AGENT = 'AGENT',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
}

export enum KycStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password_hash: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.NONE })
  kyc_status: KycStatus;

  @Column({ nullable: true })
  nic_passport_no: string;

  @Column({ default: false })
  is_verified_agent: boolean;

  @Column({ nullable: true })
  agency_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @OneToMany(() => Property, (property) => property.owner)
  properties: Property[];

  @OneToMany(() => Bid, (bid) => bid.bidder)
  bids: Bid[];

  @OneToMany(() => Inspection, (inspection) => inspection.buyer)
  inspections_requested: Inspection[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
