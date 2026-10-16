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

export enum InspectionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.inspections, { eager: true, onDelete: 'CASCADE' })
  property: Property;

  @ManyToOne(() => User, (user) => user.inspections_requested, { eager: true, onDelete: 'CASCADE' })
  buyer: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  seller: User;

  @Column({ type: 'timestamptz' })
  scheduled_at: Date;

  @Column({ type: 'text', nullable: true })
  buyer_notes: string;

  @Column({ type: 'text', nullable: true })
  seller_feedback: string;

  @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.PENDING })
  status: InspectionStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
