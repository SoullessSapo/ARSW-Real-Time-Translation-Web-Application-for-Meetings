import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Meeting } from './meeting.entity';
import { MeetingParticipant } from './meeting-participant.entity';
import { Message } from './message.entity';
import { Translation } from './translation.entity';
import { Audio } from './audio.entity';
import { Summary } from './summary.entity';
import { MeetingInvitation } from './meeting-invitation.entity';
import { Friendship } from './friendship.entity';

// ...existing code...
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Meeting,
      MeetingParticipant,
      Message,
      Translation,
      Audio,
      Summary,
      MeetingInvitation,
      Friendship,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
