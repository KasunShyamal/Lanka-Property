import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from '../../database/entities/property.entity';
import { Auction } from '../../database/entities/auction.entity';
import { User } from '../../database/entities/user.entity';
import { UserGroup } from '../../database/entities/user-group.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PublicUserGroupsController } from './public-user-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property, Auction, User, UserGroup])],
  controllers: [AdminController, PublicUserGroupsController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
