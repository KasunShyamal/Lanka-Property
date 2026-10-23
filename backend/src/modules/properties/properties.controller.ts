import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter Sri Lanka property listings' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'purpose', required: false, enum: ['SALE', 'RENT'] })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'min_price', required: false })
  @ApiQuery({ name: 'max_price', required: false })
  @ApiQuery({ name: 'bbox', required: false, description: 'minLng,minLat,maxLng,maxLat for Map viewport' })
  async findAll(@Query() query: any) {
    return this.propertiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single property by UUID or slug' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing (Pending moderation review)' })
  async create(@Req() req: any, @Body() body: any) {
    return this.propertiesService.create(req.user, body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property details' })
  async update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.propertiesService.update(id, req.user, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a property listing' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.propertiesService.delete(id, req.user);
  }
}
