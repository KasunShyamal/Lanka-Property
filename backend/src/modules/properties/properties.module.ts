import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../database/entities/property.entity';
import { PropertyCategory } from '../../database/entities/property-category.entity';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertyCategoriesController } from './property-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyCategory])],
  controllers: [PropertiesController, PropertyCategoriesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
