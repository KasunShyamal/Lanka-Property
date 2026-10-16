import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Admin & Moderation')
@Controller('admin')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform operational overview and statistics' })
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('pending-properties')
  @ApiOperation({ summary: 'Get listings awaiting moderator approval' })
  async getPendingProperties() {
    return this.adminService.getPendingProperties();
  }

  @Put('properties/:id/approve')
  @ApiOperation({ summary: 'Approve property listing to publish publicly' })
  async approveProperty(@Param('id') id: string) {
    return this.adminService.approveProperty(id);
  }

  @Put('properties/:id/reject')
  @ApiOperation({ summary: 'Reject property listing' })
  async rejectProperty(@Param('id') id: string) {
    return this.adminService.rejectProperty(id);
  }

  @Get('pending-auctions')
  @ApiOperation({ summary: 'Get auctions awaiting review' })
  async getPendingAuctions() {
    return this.adminService.getPendingAuctions();
  }

  @Put('auctions/:id/approve')
  @ApiOperation({ summary: 'Approve digital property auction' })
  async approveAuction(@Param('id') id: string) {
    return this.adminService.approveAuction(id);
  }

  @Put('agents/:id/verify')
  @ApiOperation({ summary: 'Verify real estate broker / agent credentials' })
  async verifyAgent(@Param('id') id: string, @Body() body: { is_verified: boolean }) {
    return this.adminService.verifyAgent(id, body.is_verified);
  }
}
