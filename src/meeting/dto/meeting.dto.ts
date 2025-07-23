import { IsString, IsOptional, IsIn } from 'class-validator';
import { IsUUID } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsIn(['public', 'private', 'friends'])
  type?: string; // default 'public'
}
export class JoinLeaveMeetingDto {
  @IsUUID()
  meetingId: string;
}

export class InviteMeetingDto {
  @IsUUID()
  meetingId: string;

  @IsUUID()
  invitedId: string;
}

export class AcceptInvitationDto {
  @IsUUID()
  invitationId: string;
}

export class AddFriendDto {
  @IsUUID()
  addresseeName: string;
}

export class AcceptFriendshipDto {
  @IsUUID()
  requesterId: string;
}
