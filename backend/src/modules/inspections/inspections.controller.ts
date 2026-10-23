import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('In-Person Inspections')
@Controller('inspections')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List user inspections (requested and incoming visits)' })
  async findAll(@Req() req: any) {
    return this.inspectionsService.findAllForUser(req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Book an in-person inspection time slot' })
  async create(@Req() req: any, @Body() body: any) {
    return this.inspectionsService.create(req.user, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Confirm, decline or update inspection status' })
  async updateStatus(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.inspectionsService.updateStatus(id, req.user, body);
  }
}
