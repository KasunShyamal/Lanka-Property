import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExchangesService } from './exchanges.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Property Exchanges')
@Controller('exchanges')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Get()
  @ApiOperation({ summary: 'List sent and received property exchange proposals' })
  async findAll(@Req() req: any) {
    return this.exchangesService.findAllForUser(req.user);
  }

  @Post()
  @ApiOperation({ summary: 'Propose a property swap with cash adjustment' })
  async create(@Req() req: any, @Body() body: any) {
    return this.exchangesService.create(req.user, body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Accept in principle, decline, or withdraw exchange proposal' })
  async updateStatus(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.exchangesService.updateStatus(id, req.user, body);
  }
}
