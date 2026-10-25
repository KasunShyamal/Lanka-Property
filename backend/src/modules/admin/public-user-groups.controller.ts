import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('User Groups Master Data')
@Controller('user-groups')
export class PublicUserGroupsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get user groups available for public customer registration (Buyer, Seller, Agent)' })
  async getPublicGroups() {
    return this.adminService.getPublicUserGroups();
  }
}
