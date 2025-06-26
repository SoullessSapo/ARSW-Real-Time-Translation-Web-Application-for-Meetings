import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meeting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { MeetingInvitation } from '../entities/meeting-invitation.entity';

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
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
