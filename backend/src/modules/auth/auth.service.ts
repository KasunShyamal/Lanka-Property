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
        avatar_url: user.avatar_url,
      },
      token,
    };
  }

  async googleLogin(dto: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
    credential?: string;
    role?: UserRole;
    agency_name?: string;
  }) {
    let email = dto.email;
    let full_name = dto.full_name;
    let avatar_url = dto.avatar_url;

    // Decode Google Identity Services ID token if provided
    if (dto.credential) {
      try {
        const parts = dto.credential.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (decoded.email) email = decoded.email;
          if (decoded.name) full_name = decoded.name;
          if (decoded.picture) avatar_url = decoded.picture;
        }
      } catch (err) {
        console.error('Failed to decode Google credential:', err);
      }
    }

    if (!email) {
      throw new UnauthorizedException('Missing valid Google account email');
    }

    let user = await this.userRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(Math.random().toString(36) + 'GoogleAuth#2026', salt);
      user = this.userRepo.create({
        email: email.toLowerCase(),
        password_hash,
        full_name: full_name || 'Google User',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        role: dto.role || UserRole.BUYER,
        agency_name: dto.role === UserRole.AGENT ? dto.agency_name : undefined,
        kyc_status: KycStatus.VERIFIED,
        is_verified_agent: false,
      });
      user = await this.userRepo.save(user);
    } else if (dto.role && user.role !== dto.role && user.role !== UserRole.SUPER_ADMIN) {
      user.role = dto.role;
      if (dto.agency_name) user.agency_name = dto.agency_name;
      user = await this.userRepo.save(user);
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
        avatar_url: user.avatar_url,
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
