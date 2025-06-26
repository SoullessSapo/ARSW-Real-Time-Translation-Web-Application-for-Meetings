import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { MeetingsService } from './meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMeetingDto,
  AcceptFriendshipDto,
  AcceptInvitationDto,
  AddFriendDto,
  InviteMeetingDto,
  JoinLeaveMeetingDto,
} from './dto/meeting.dto';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  // Crear reunión
  @Post('create')
  async createMeeting(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createMeeting(dto.title, req.user.id, dto.type);
  }

  // Unirse a reunión
  @Post('join')
  async joinMeeting(
    @Request() req: { user: { id: string } },
    @Body() dto: JoinLeaveMeetingDto,
  ) {
    return this.meetingsService.joinMeeting(
      String(dto.meetingId),
      String(req.user.id),
    );
  }

  // Salir de reunión
  @Post('leave')
  async leaveMeeting(
    @Request() req: { user: { id: string } },
    @Body() dto: JoinLeaveMeetingDto,
  ) {
    return this.meetingsService.leaveMeeting(
      String(dto.meetingId),
      String(req.user.id),
    );
  }

  // Ver participantes activos
  @Get(':meetingId/participants')
  async listParticipants(@Param('meetingId') meetingId: string) {
    return this.meetingsService.listParticipants(meetingId);
  }

  // Solicitar amistad
  @Post('friend/request')
  async addFriend(
    @Request() req: { user: { id: string } },
    @Body() dto: AddFriendDto,
  ) {
    return this.meetingsService.addFriend(
      String(req.user.id),
      String(dto.addresseeId),
    );
  }

  // Aceptar amistad
  @Post('friend/accept')
  async acceptFriendship(
    @Request() req: { user: { id: string } },
    @Body() dto: AcceptFriendshipDto,
  ) {
    return this.meetingsService.acceptFriendship(
      String(dto.requesterId),
      String(req.user.id),
    );
  }

  // Invitar a reunión privada
  @Post('invite')
  async inviteToMeeting(
    @Request() req: { user: { id: string } },
    @Body() dto: InviteMeetingDto,
  ) {
    return this.meetingsService.inviteToMeeting(
      dto.meetingId,
      dto.invitedId,
      req.user.id,
    );
  }

  // Aceptar invitación a reunión
  @Post('invite/accept')
  async acceptMeetingInvitation(
    @Request() req: { user: { id: string } },
    @Body() dto: AcceptInvitationDto,
  ) {
    return this.meetingsService.acceptMeetingInvitation(
      dto.invitationId,
      req.user.id,
    );
  }
  // Ver amigos aceptados
  @Get('friend/list')
  async listFriends(@Request() req: { user: { id: string } }) {
    return this.meetingsService.listFriends(req.user.id);
  }

  // Ver solicitudes de amistad pendientes (que yo debo aceptar)
  @Get('friend/requests')
  async listPendingFriendRequests(@Request() req: { user: { id: string } }) {
    return this.meetingsService.listPendingFriendRequests(req.user.id);
  }

  // Ver invitaciones a reuniones (que yo debo aceptar)
  @Get('invite/pending')
  async listPendingInvitations(@Request() req: { user: { id: string } }) {
    return this.meetingsService.listPendingInvitations(req.user.id);
  }
}
