import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Auction } from './auction.entity';
import { User } from './user.entity';

export enum BidStatus {
  ACCEPTED = 'ACCEPTED',
  OUTBID = 'OUTBID',
  WINNING = 'WINNING',
  REJECTED = 'REJECTED',
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Auction, (auction) => auction.bids, { onDelete: 'CASCADE' })
  auction: Auction;

  @ManyToOne(() => User, (user) => user.bids, { eager: true, onDelete: 'CASCADE' })
  bidder: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.ACCEPTED })
  status: BidStatus;

  @Column({ nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}
