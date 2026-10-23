import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Property } from './property.entity';
import { User } from './user.entity';

export enum ExchangeStatus {
  PROPOSED = 'PROPOSED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COUNTERED = 'COUNTERED',
  ACCEPTED_IN_PRINCIPLE = 'ACCEPTED_IN_PRINCIPLE',
  DECLINED = 'DECLINED',
  WITHDRAWN = 'WITHDRAWN',
}

@Entity('exchanges')
export class Exchange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, { eager: true, onDelete: 'CASCADE' })
  offered_property: Property;

  @ManyToOne(() => Property, { eager: true, onDelete: 'CASCADE' })
  target_property: Property;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  proposer: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  target_owner: User;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cash_adjustment_lkr: number;

  @Column({ type: 'text', nullable: true })
  proposal_notes: string;

  @Column({ type: 'text', nullable: true })
  response_notes: string;

  @Column({ type: 'enum', enum: ExchangeStatus, default: ExchangeStatus.PROPOSED })
  status: ExchangeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
