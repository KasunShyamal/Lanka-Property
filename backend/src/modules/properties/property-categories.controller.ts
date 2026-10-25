import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyCategory } from '../../database/entities/property-category.entity';

@ApiTags('Property Categories')
@Controller('property-categories')
export class PropertyCategoriesController {
  constructor(
    @InjectRepository(PropertyCategory)
    private readonly categoryRepo: Repository<PropertyCategory>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active master data property categories with colors and icons' })
  async getCategories() {
    return this.categoryRepo.find({
      where: { is_active: true },
      order: { display_order: 'ASC', name: 'ASC' },
    });
  }
}
