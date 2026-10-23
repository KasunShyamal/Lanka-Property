import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  CLOSED_RESERVE_MET = 'CLOSED_RESERVE_MET',
  CLOSED_RESERVE_NOT_MET = 'CLOSED_RESERVE_NOT_MET',
  CANCELLED = 'CANCELLED',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.auctions, { eager: true, onDelete: 'CASCADE' })
  property: Property;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  seller: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  starting_bid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  reserve_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  current_highest_bid: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  highest_bidder: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 100000 })
  bid_increment: number;

  @Column({ type: 'timestamptz' })
  starts_at: Date;

  @Column({ type: 'timestamptz' })
  ends_at: Date;

  @Column({ type: 'enum', enum: AuctionStatus, default: AuctionStatus.PENDING })
  status: AuctionStatus;

  @Column({ default: true })
  soft_close_enabled: boolean;

  @Column({ default: 120 })
  soft_close_seconds: number;

  @Column({ default: 0 })
  total_bids_count: number;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
