import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship])],
  providers: [FriendshipService, NotificationsGateway],
  controllers: [FriendshipController],
  exports: [FriendshipService],
})
export class FriendshipModule {}
