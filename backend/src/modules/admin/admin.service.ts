import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Property, PropertyStatus } from '../../database/entities/property.entity';
import { Auction, AuctionStatus } from '../../database/entities/auction.entity';
import { User, KycStatus, UserRole } from '../../database/entities/user.entity';
import { UserGroup } from '../../database/entities/user-group.entity';
import { PropertyCategory } from '../../database/entities/property-category.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(Auction)
    private readonly auctionRepo: Repository<Auction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(PropertyCategory)
    private readonly categoryRepo: Repository<PropertyCategory>,
  ) {}

  async getDashboardStats() {
    const totalProperties = await this.propertyRepo.count();
    const pendingProperties = await this.propertyRepo.count({ where: { status: PropertyStatus.PENDING } });
    const liveAuctions = await this.auctionRepo.count({ where: { status: AuctionStatus.LIVE } });
    const totalUsers = await this.userRepo.count();
    const verifiedAgents = await this.userRepo.count({ where: { is_verified_agent: true } });
    const totalGroups = await this.groupRepo.count();

    return {
      totalProperties,
      pendingProperties,
      liveAuctions,
      totalUsers,
      verifiedAgents,
      totalGroups,
    };
  }

  async getPendingProperties() {
    return this.propertyRepo.find({
      where: [
        { status: PropertyStatus.PENDING },
        { has_pending_update: true },
      ],
      relations: ['owner', 'category'],
      order: { updated_at: 'DESC' },
    });
  }

  async approveProperty(id: string) {
    const prop = await this.propertyRepo.findOne({
      where: { id },
      relations: ['category', 'owner'],
    });
    if (!prop) throw new NotFoundException('Property not found');

    if (prop.has_pending_update && prop.pending_update) {
      const updateData = { ...prop.pending_update };
      delete updateData.submitted_at;
      delete updateData.category_name;

      if (updateData.category_id) {
        const cat = await this.categoryRepo.findOne({ where: { id: updateData.category_id } });
        if (cat) {
          prop.category = cat;
          prop.category_id = cat.id;
          prop.property_type = cat.code;
        }
      }

      Object.assign(prop, updateData);
      prop.pending_update = null as any;
      prop.has_pending_update = false;
    }

    prop.status = PropertyStatus.APPROVED;
    prop.moderation_notes = null as any;
    return this.propertyRepo.save(prop);
  }

  async rejectProperty(id: string, reason?: string) {
    const prop = await this.propertyRepo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException('Property not found');

    if (prop.has_pending_update) {
      // Rejection of an edit: discard the pending update and retain the active listing
      prop.pending_update = null as any;
      prop.has_pending_update = false;
      if (reason) prop.moderation_notes = reason;
    } else {
      prop.status = PropertyStatus.REJECTED;
      if (reason) prop.moderation_notes = reason;
    }

    return this.propertyRepo.save(prop);
  }

  async getPendingAuctions() {
    return this.auctionRepo.find({
      where: { status: AuctionStatus.PENDING },
      relations: ['property', 'seller'],
      order: { created_at: 'DESC' },
    });
  }

  async approveAuction(id: string) {
    const auction = await this.auctionRepo.findOne({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    const now = new Date();
    if (now >= new Date(auction.starts_at) && now < new Date(auction.ends_at)) {
      auction.status = AuctionStatus.LIVE;
    } else {
      auction.status = AuctionStatus.APPROVED;
    }
    return this.auctionRepo.save(auction);
  }

  async verifyAgent(userId: string, is_verified: boolean) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.is_verified_agent = is_verified;
    if (is_verified) {
      user.role = UserRole.AGENT;
      user.kyc_status = KycStatus.VERIFIED;
    }
    return this.userRepo.save(user);
  }

  // ==============================================================
  // MASTER DATA: USER GROUPS MANAGEMENT
  // ==============================================================

  async getPublicUserGroups() {
    return this.groupRepo.find({
      where: { is_public_registration: true },
      order: { created_at: 'ASC' },
    });
  }

  async getUserGroups() {
    const groups = await this.groupRepo.find({
      order: { created_at: 'ASC' },
      relations: ['users'],
    });

    return groups.map((g) => ({
      id: g.id,
      code: g.code,
      name: g.name,
      description: g.description,
      is_public_registration: g.is_public_registration,
      is_system_group: g.is_system_group,
      user_count: g.users ? g.users.length : 0,
      created_at: g.created_at,
      updated_at: g.updated_at,
    }));
  }

  async createUserGroup(dto: {
    name: string;
    code: string;
    description?: string;
    is_public_registration?: boolean;
  }) {
    const normalizedCode = dto.code.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = await this.groupRepo.findOne({ where: { code: normalizedCode } });
    if (existing) {
      throw new ConflictException(`User group with code '${normalizedCode}' already exists`);
    }

    const group = this.groupRepo.create({
      name: dto.name.trim(),
      code: normalizedCode,
      description: dto.description?.trim(),
      is_public_registration: Boolean(dto.is_public_registration),
      is_system_group: false,
    });

    return this.groupRepo.save(group);
  }

  async updateUserGroup(
    id: string,
    dto: {
      name?: string;
      description?: string;
      is_public_registration?: boolean;
    },
  ) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException('User group not found');

    if (dto.name) group.name = dto.name.trim();
    if (dto.description !== undefined) group.description = dto.description?.trim();
    if (dto.is_public_registration !== undefined) {
      group.is_public_registration = Boolean(dto.is_public_registration);
    }

    return this.groupRepo.save(group);
  }

  async deleteUserGroup(id: string) {
    const group = await this.groupRepo.findOne({ where: { id }, relations: ['users'] });
    if (!group) throw new NotFoundException('User group not found');

    if (group.is_system_group) {
      throw new BadRequestException('System core user groups cannot be deleted');
    }

    if (group.users && group.users.length > 0) {
      throw new BadRequestException(
        `Cannot delete user group '${group.name}' because ${group.users.length} user(s) are assigned to it. Please reassign those users first.`,
      );
    }

    await this.groupRepo.remove(group);
    return { success: true, message: `User group '${group.name}' deleted successfully` };
  }

  // ==============================================================
  // MASTER DATA: SYSTEM USERS MANAGEMENT (Staff, Data Entry, Accountants, Admins)
  // ==============================================================

  async getSystemUsers() {
    return this.userRepo.find({
      relations: ['group'],
      order: { created_at: 'DESC' },
    });
  }

  async createSystemUser(dto: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    group_id: string;
  }) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('A user with this email address already exists');
    }

    const group = await this.groupRepo.findOne({ where: { id: dto.group_id } });
    if (!group) {
      throw new NotFoundException('Selected user group not found');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = this.userRepo.create({
      full_name: dto.full_name.trim(),
      email: dto.email.trim().toLowerCase(),
      password_hash,
      phone: dto.phone?.trim(),
      group_id: group.id,
      group: group,
      role: group.code,
      kyc_status: KycStatus.VERIFIED,
      is_verified_agent: group.code === 'AGENT',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dto.full_name)}&backgroundColor=059669`,
    });

    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      full_name: saved.full_name,
      email: saved.email,
      phone: saved.phone,
      role: saved.role,
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
      },
      kyc_status: saved.kyc_status,
      created_at: saved.created_at,
    };
  }

  async updateSystemUser(
    id: string,
    dto: {
      full_name?: string;
      phone?: string;
      group_id?: string;
      password?: string;
    },
  ) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['group'] });
    if (!user) throw new NotFoundException('User not found');

    if (dto.full_name) user.full_name = dto.full_name.trim();
    if (dto.phone !== undefined) user.phone = dto.phone?.trim();

    if (dto.group_id && dto.group_id !== user.group_id) {
      const group = await this.groupRepo.findOne({ where: { id: dto.group_id } });
      if (!group) throw new NotFoundException('User group not found');
      user.group_id = group.id;
      user.group = group;
      user.role = group.code;
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(dto.password, salt);
    }

    const saved = await this.userRepo.save(user);
    return {
      id: saved.id,
      full_name: saved.full_name,
      email: saved.email,
      phone: saved.phone,
      role: saved.role,
      group: saved.group ? { id: saved.group.id, name: saved.group.name, code: saved.group.code } : null,
      updated_at: saved.updated_at,
    };
  }

  async deleteSystemUser(id: string, currentAdminId?: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own admin account');
    }

    if (user.email === 'admin@lankaproperty.lk') {
      throw new BadRequestException('The primary system super administrator account cannot be deleted');
    }

    await this.userRepo.remove(user);
    return { success: true, message: `System user '${user.full_name}' deleted successfully` };
  }

  // ==========================================
  // MASTER DATA: PROPERTY CATEGORIES
  // ==========================================
  async getPropertyCategories() {
    const categories = await this.categoryRepo.find({
      order: { display_order: 'ASC', name: 'ASC' },
      relations: ['properties'],
    });

    return categories.map((cat) => ({
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description,
      color_code: cat.color_code || '#10B981',
      icon: cat.icon || 'Home',
      is_active: cat.is_active,
      display_order: cat.display_order,
      property_count: cat.properties ? cat.properties.length : 0,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    }));
  }

  async createPropertyCategory(dto: {
    code: string;
    name: string;
    description?: string;
    color_code?: string;
    icon?: string;
    display_order?: number;
    is_active?: boolean;
  }) {
    const existing = await this.categoryRepo.findOne({
      where: { code: dto.code.trim().toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(`Category code '${dto.code}' already exists`);
    }

    const category = this.categoryRepo.create({
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      description: dto.description?.trim(),
      color_code: dto.color_code?.trim() || '#10B981',
      icon: dto.icon?.trim() || 'Home',
      display_order: dto.display_order ?? 0,
      is_active: dto.is_active ?? true,
    });

    return this.categoryRepo.save(category);
  }

  async updatePropertyCategory(
    id: string,
    dto: {
      name?: string;
      description?: string;
      color_code?: string;
      icon?: string;
      display_order?: number;
      is_active?: boolean;
    },
  ) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Property category not found');

    if (dto.name) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description?.trim();
    if (dto.color_code) category.color_code = dto.color_code.trim();
    if (dto.icon) category.icon = dto.icon.trim();
    if (dto.display_order !== undefined) category.display_order = dto.display_order;
    if (dto.is_active !== undefined) category.is_active = dto.is_active;

    return this.categoryRepo.save(category);
  }

  async deletePropertyCategory(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['properties'],
    });
    if (!category) throw new NotFoundException('Property category not found');

    if (category.properties && category.properties.length > 0) {
      throw new BadRequestException(
        `Cannot delete category '${category.name}' because ${category.properties.length} active property listing(s) are assigned to it. Please reassign them first.`,
      );
    }

    await this.categoryRepo.remove(category);
    return { success: true, message: `Category '${category.name}' deleted successfully` };
  }
}
