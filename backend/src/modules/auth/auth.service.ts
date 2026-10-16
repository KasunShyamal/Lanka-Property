import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, KycStatus } from '../../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role?: UserRole;
    nic_passport_no?: string;
    agency_name?: string;
  }) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      password_hash,
      full_name: dto.full_name,
      phone: dto.phone,
      role: dto.role || UserRole.BUYER,
      kyc_status: dto.nic_passport_no ? KycStatus.PENDING : KycStatus.NONE,
      nic_passport_no: dto.nic_passport_no,
      agency_name: dto.agency_name,
      is_verified_agent: false,
    });

    const saved = await this.userRepo.save(user);
    const token = this.generateToken(saved);

    return {
      user: {
        id: saved.id,
        email: saved.email,
        full_name: saved.full_name,
        role: saved.role,
        kyc_status: saved.kyc_status,
        is_verified_agent: saved.is_verified_agent,
      },
      token,
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email: dto.email.toLowerCase() })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        kyc_status: user.kyc_status,
        is_verified_agent: user.is_verified_agent,
        agency_name: user.agency_name,
      },
      token,
    };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
