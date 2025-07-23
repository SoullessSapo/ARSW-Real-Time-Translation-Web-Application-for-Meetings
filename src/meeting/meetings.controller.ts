import { Logger } from '@nestjs/common';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Request,
} from '@nestjs/common';
import { Delete, HttpCode } from '@nestjs/common'; // arriba

import { MeetingsService } from './meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateMeetingDto,
  AcceptInvitationDto,
  InviteMeetingDto,
  JoinLeaveMeetingDto,
} from './dto/meeting.dto';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  private readonly logger = new Logger(MeetingsController.name);
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
    this.logger.log(
      `[POST /meetings/leave] user: ${JSON.stringify(req.user)}, body: ${JSON.stringify(dto)}`,
    );
    return this.meetingsService.leaveMeeting(
      String(dto.meetingId),
      String(req.user.id),
    );
  }
  @Delete(':meetingId')
  @HttpCode(204)
  async deleteMeeting(
    @Request() req: { user: { id: string } },
    @Param('meetingId') meetingId: string,
  ) {
    await this.meetingsService.deleteMeeting(meetingId, req.user.id);
  }

  // Listar todas las reuniones (puedes filtrar solo activas, públicas, etc.)
  @Get('all')
  async listAllMeetings() {
    return this.meetingsService.listAllMeetings();
  }
  @Get('friends/:userId')
  async listFriendsMeetings(@Param('userId') userId: string) {
    return this.meetingsService.listFriendsMeetings(userId);
  }

  // Listar reuniones propias del usuario
  @Get('user/:userId')
  async listUserMeetings(@Param('userId') userId: string) {
    return this.meetingsService.listUserMeetings(userId);
  }

  // Ver participantes activos
  @Get(':meetingId/participants')
  async listParticipants(@Param('meetingId') meetingId: string) {
    this.logger.log(`[GET /meetings/${meetingId}/participants]`);
    return this.meetingsService.listParticipants(meetingId);
  }

  // Invitar a reunión privada
  @Post('invite')
  async inviteToMeeting(
    @Request() req: { user: { id: string } },
    @Body() dto: InviteMeetingDto,
  ) {
    this.logger.log(
      `[POST /meetings/invite] user: ${JSON.stringify(req.user)}, body: ${JSON.stringify(dto)}`,
    );
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
    this.logger.log(
      `[POST /meetings/invite/accept] user: ${JSON.stringify(req.user)}, body: ${JSON.stringify(dto)}`,
    );
    return this.meetingsService.acceptMeetingInvitation(
      dto.invitationId,
      req.user.id,
    );
  }
}
