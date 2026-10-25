import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
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

  // ==============================================================
  // USER GROUPS (MASTER DATA)
  // ==============================================================

  @Get('user-groups')
  @ApiOperation({ summary: 'Get all user groups master data' })
  async getUserGroups() {
    return this.adminService.getUserGroups();
  }

  @Post('user-groups')
  @ApiOperation({ summary: 'Create a new user group (e.g. Data Entry, Accountant)' })
  async createUserGroup(
    @Body()
    body: {
      name: string;
      code: string;
      description?: string;
      is_public_registration?: boolean;
    },
  ) {
    return this.adminService.createUserGroup(body);
  }

  @Put('user-groups/:id')
  @ApiOperation({ summary: 'Update an existing user group' })
  async updateUserGroup(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      is_public_registration?: boolean;
    },
  ) {
    return this.adminService.updateUserGroup(id, body);
  }

  @Delete('user-groups/:id')
  @ApiOperation({ summary: 'Delete a user group (non-system groups only)' })
  async deleteUserGroup(@Param('id') id: string) {
    return this.adminService.deleteUserGroup(id);
  }

  // ==============================================================
  // SYSTEM USERS MANAGEMENT (Staff, Operators, Accountants, Admins)
  // ==============================================================

  @Get('system-users')
  @ApiOperation({ summary: 'Get all system users and their assigned groups' })
  async getSystemUsers() {
    return this.adminService.getSystemUsers();
  }

  @Post('system-users')
  @ApiOperation({ summary: 'Create a new system user assigned to a user group' })
  async createSystemUser(
    @Body()
    body: {
      full_name: string;
      email: string;
      password: string;
      phone?: string;
      group_id: string;
    },
  ) {
    return this.adminService.createSystemUser(body);
  }

  @Put('system-users/:id')
  @ApiOperation({ summary: 'Update a system user' })
  async updateSystemUser(
    @Param('id') id: string,
    @Body()
    body: {
      full_name?: string;
      phone?: string;
      group_id?: string;
      password?: string;
    },
  ) {
    return this.adminService.updateSystemUser(id, body);
  }

  @Delete('system-users/:id')
  @ApiOperation({ summary: 'Delete a system user' })
  async deleteSystemUser(@Param('id') id: string, @Req() req: any) {
    const currentAdminId = req.user?.id || req.user?.sub;
    return this.adminService.deleteSystemUser(id, currentAdminId);
  }
}
