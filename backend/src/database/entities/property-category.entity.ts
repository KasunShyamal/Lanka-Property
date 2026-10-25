import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Property } from './property.entity';

@Entity('property_categories')
export class PropertyCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: '#10B981' })
  color_code: string;

  @Column({ default: 'Home' })
  icon: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @OneToMany(() => Property, (property) => property.category)
  properties: Property[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
