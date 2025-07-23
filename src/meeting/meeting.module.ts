import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { MeetingInvitation } from '../entities/meeting-invitation.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';
import { SignalingGateway } from '../gateways/SignalingGateway.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Meeting,
      MeetingParticipant,
      User,
      Friendship,
      MeetingParticipant,
      MeetingInvitation,
    ]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService, NotificationsGateway, SignalingGateway],
  exports: [MeetingsService],
})
export class MeetingsModule {}
