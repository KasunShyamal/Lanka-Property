import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus, PropertyPurpose, PropertyType } from '../../database/entities/property.entity';
import { PropertyCategory } from '../../database/entities/property-category.entity';
import { User, UserRole } from '../../database/entities/user.entity';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PropertyCategory)
    private readonly categoryRepo: Repository<PropertyCategory>,
  ) {}

  async findAll(query: {
    search?: string;
    purpose?: PropertyPurpose;
    property_type?: PropertyType;
    district?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    bedrooms?: number;
    min_perches?: number;
    max_perches?: number;
    is_exchange_eligible?: boolean;
    is_featured?: boolean;
    bbox?: string; // minLng,minLat,maxLng,maxLat
    lat?: number;
    lng?: number;
    radius_km?: number;
    limit?: number;
    offset?: number;
  }) {
    const qb = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.category', 'category')
      .where('property.status = :status', { status: PropertyStatus.APPROVED });

    if (query.search) {
      qb.andWhere(
        '(LOWER(property.title) LIKE :search OR LOWER(property.city) LIKE :search OR LOWER(property.district) LIKE :search OR LOWER(property.address) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    if (query.purpose) {
      qb.andWhere('property.purpose = :purpose', { purpose: query.purpose });
    }

    if (query.property_type || (query as any).category_id) {
      if ((query as any).category_id) {
        qb.andWhere('(property.category_id = :catId OR property.property_type = :propType)', {
          catId: (query as any).category_id,
          propType: query.property_type,
        });
      } else {
        qb.andWhere('(property.property_type = :property_type OR category.code = :property_type)', {
          property_type: query.property_type,
        });
      }
    }

    if (query.district) {
      qb.andWhere('LOWER(property.district) = LOWER(:district)', { district: query.district });
    }

    if (query.city) {
      qb.andWhere('LOWER(property.city) = LOWER(:city)', { city: query.city });
    }

    if (query.min_price) {
      qb.andWhere('property.price_lkr >= :min_price', { min_price: query.min_price });
    }

    if (query.max_price) {
      qb.andWhere('property.price_lkr <= :max_price', { max_price: query.max_price });
    }

    if (query.bedrooms) {
      qb.andWhere('property.bedrooms >= :bedrooms', { bedrooms: query.bedrooms });
    }

    if (query.min_perches) {
      qb.andWhere('property.land_perches >= :min_perches', { min_perches: query.min_perches });
    }

    if (query.max_perches) {
      qb.andWhere('property.land_perches <= :max_perches', { max_perches: query.max_perches });
    }

    if (query.is_exchange_eligible !== undefined) {
      qb.andWhere('property.is_exchange_eligible = :is_exchange_eligible', {
        is_exchange_eligible: query.is_exchange_eligible,
      });
    }

    if (query.is_featured !== undefined) {
      qb.andWhere('property.is_featured = :is_featured', { is_featured: query.is_featured });
    }

    // Geospatial Bounding Box filtering (Map Viewport)
    if (query.bbox) {
      const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);
      if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
        qb.andWhere(
          'property.longitude >= :minLng AND property.longitude <= :maxLng AND property.latitude >= :minLat AND property.latitude <= :maxLat',
          { minLng, minLat, maxLng, maxLat },
        );
      }
    }

    qb.orderBy('property.is_featured', 'DESC')
      .addOrderBy('property.created_at', 'DESC')
      .take(query.limit || 50)
      .skip(query.offset || 0);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: string) {
    const property = await this.propertyRepo.findOne({
      where: [{ id }, { slug: id }],
      relations: ['owner', 'auctions', 'category'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID/Slug '${id}' not found`);
    }
    return property;
  }

  async create(user: User, data: any) {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${slugBase}-${randomSuffix}`;

    const price = Number(data.price_lkr);
    const land_perches = data.land_perches ? Number(data.land_perches) : null;
    const floor_sqft = data.floor_sqft ? Number(data.floor_sqft) : null;

    const price_per_perch = land_perches && land_perches > 0 ? Math.round(price / land_perches) : null;
    const price_per_sqft = floor_sqft && floor_sqft > 0 ? Math.round(price / floor_sqft) : null;

    let category = null;
    if (data.category_id) {
      category = await this.categoryRepo.findOne({ where: { id: data.category_id } });
    } else if (data.property_type) {
      category = await this.categoryRepo.findOne({ where: { code: data.property_type } });
    }

    const property = this.propertyRepo.create({
      ...data,
      slug,
      price_lkr: price,
      land_perches,
      floor_sqft,
      price_per_perch,
      price_per_sqft,
      category_id: category?.id,
      category: category || undefined,
      property_type: category?.code || data.property_type || 'HOUSE',
      status: user.role === UserRole.SUPER_ADMIN || user.role === UserRole.MODERATOR ? PropertyStatus.APPROVED : PropertyStatus.PENDING,
      owner: user,
    });

    return this.propertyRepo.save(property);
  }

  async update(id: string, user: User, data: any) {
    const property = await this.findOne(id);
    if (property.owner.id !== user.id && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MODERATOR) {
      throw new ForbiddenException('You do not have permission to edit this property');
    }

    if (data.category_id || data.property_type) {
      let category = null;
      if (data.category_id) {
        category = await this.categoryRepo.findOne({ where: { id: data.category_id } });
      } else if (data.property_type) {
        category = await this.categoryRepo.findOne({ where: { code: data.property_type } });
      }
      if (category) {
        property.category = category;
        property.category_id = category.id;
        property.property_type = category.code;
      }
    }

    Object.assign(property, data);
    return this.propertyRepo.save(property);
  }

  async delete(id: string, user: User) {
    const property = await this.findOne(id);
    if (property.owner.id !== user.id && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MODERATOR) {
      throw new ForbiddenException('You do not have permission to delete this property');
    }

    await this.propertyRepo.remove(property);
    return { success: true, message: 'Property listing removed' };
  }
}
