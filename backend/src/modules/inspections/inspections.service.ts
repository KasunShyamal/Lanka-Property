import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection, InspectionStatus } from '../../database/entities/inspection.entity';
import { Property } from '../../database/entities/property.entity';
import { User, UserRole } from '../../database/entities/user.entity';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepo: Repository<Inspection>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async findAllForUser(user: User) {
    return this.inspectionRepo.find({
      where: [
        { buyer: { id: user.id } },
        { seller: { id: user.id } },
      ],
      relations: ['property', 'buyer', 'seller'],
      order: { scheduled_at: 'ASC' },
    });
  }

  async create(buyer: User, data: { property_id: string; scheduled_at: string; buyer_notes?: string }) {
    const property = await this.propertyRepo.findOne({
      where: { id: data.property_id },
      relations: ['owner'],
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.owner.id === buyer.id) {
      throw new ForbiddenException('You cannot schedule an inspection on your own property');
    }

    const inspection = this.inspectionRepo.create({
      property,
      buyer,
      seller: property.owner,
      scheduled_at: new Date(data.scheduled_at),
      buyer_notes: data.buyer_notes,
      status: InspectionStatus.PENDING,
    });

    return this.inspectionRepo.save(inspection);
  }

  async updateStatus(
    id: string,
    user: User,
    data: { status: InspectionStatus; seller_feedback?: string },
  ) {
    const inspection = await this.inspectionRepo.findOne({
      where: { id },
      relations: ['property', 'buyer', 'seller'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection request not found');
    }

    const isSeller = inspection.seller.id === user.id;
    const isBuyer = inspection.buyer.id === user.id;
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MODERATOR;

    if (!isSeller && !isBuyer && !isAdmin) {
      throw new ForbiddenException('Not authorized to update this inspection');
    }

    inspection.status = data.status;
    if (data.seller_feedback) {
      inspection.seller_feedback = data.seller_feedback;
    }

    return this.inspectionRepo.save(inspection);
  }
}
