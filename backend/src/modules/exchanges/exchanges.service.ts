import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange, ExchangeStatus } from '../../database/entities/exchange.entity';
import { Property, PropertyStatus } from '../../database/entities/property.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepo: Repository<Exchange>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async findAllForUser(user: User) {
    return this.exchangeRepo.find({
      where: [
        { proposer: { id: user.id } },
        { target_owner: { id: user.id } },
      ],
      relations: ['offered_property', 'target_property', 'proposer', 'target_owner'],
      order: { created_at: 'DESC' },
    });
  }

  async create(
    user: User,
    data: {
      offered_property_id: string;
      target_property_id: string;
      cash_adjustment_lkr?: number;
      proposal_notes?: string;
    },
  ) {
    if (data.offered_property_id === data.target_property_id) {
      throw new BadRequestException('Cannot exchange a property for itself');
    }

    const offered = await this.propertyRepo.findOne({
      where: { id: data.offered_property_id },
      relations: ['owner'],
    });

    const target = await this.propertyRepo.findOne({
      where: { id: data.target_property_id },
      relations: ['owner'],
    });

    if (!offered || !target) {
      throw new NotFoundException('One or both properties not found');
    }

    if (offered.owner.id !== user.id) {
      throw new ForbiddenException('You can only offer a property you own for exchange');
    }

    if (!target.is_exchange_eligible) {
      throw new BadRequestException('The target property is not opted into property exchanges');
    }

    const exchange = this.exchangeRepo.create({
      offered_property: offered,
      target_property: target,
      proposer: user,
      target_owner: target.owner,
      cash_adjustment_lkr: Number(data.cash_adjustment_lkr || 0),
      proposal_notes: data.proposal_notes,
      status: ExchangeStatus.PROPOSED,
    });

    return this.exchangeRepo.save(exchange);
  }

  async updateStatus(
    id: string,
    user: User,
    data: { status: ExchangeStatus; response_notes?: string },
  ) {
    const exchange = await this.exchangeRepo.findOne({
      where: { id },
      relations: ['offered_property', 'target_property', 'proposer', 'target_owner'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange proposal not found');
    }

    const isTargetOwner = exchange.target_owner.id === user.id;
    const isProposer = exchange.proposer.id === user.id;

    if (!isTargetOwner && !isProposer) {
      throw new ForbiddenException('You are not authorized to update this exchange proposal');
    }

    exchange.status = data.status;
    if (data.response_notes) {
      exchange.response_notes = data.response_notes;
    }

    return this.exchangeRepo.save(exchange);
  }
}
