import { BadRequestException } from '@nestjs/common';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm'; // <-- Agrega IsNull aquí
import { Meeting } from '../entities/meeting.entity';
import { MeetingParticipant } from '../entities/meeting-participant.entity';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { MeetingInvitation } from '../entities/meeting-invitation.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThanOrEqual } from 'typeorm';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingRepo: Repository<Meeting>,
    @InjectRepository(MeetingParticipant)
    private participantRepo: Repository<MeetingParticipant>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    @InjectRepository(MeetingInvitation)
    private invitationRepo: Repository<MeetingInvitation>,
    // ¡AQUÍ!
    private notificationsGateway: NotificationsGateway,
  ) {}
  // ...
  async deleteMeeting(meetingId: string, userId: string) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
      relations: ['createdBy'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.createdBy.id !== userId)
      throw new ForbiddenException('Only the creator can delete');

    // Elimina primero los participantes asociados a la reunión
    await this.participantRepo.delete({ meeting: { id: meetingId } });

    // Ahora elimina la reunión
    await this.meetingRepo.delete(meetingId);
    return;
  }
  // 1. Crear una reunión (type: 'public', 'private', 'friends')
  async createMeeting(title: string, userId: string, type: string = 'public') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const meeting = this.meetingRepo.create({ title, createdBy: user, type });
    await this.meetingRepo.save(meeting);
    await this.participantRepo.save(
      this.participantRepo.create({
        meeting,
        user,
        joinedAt: new Date(),
        language: user.language,
      }),
    );
    // Notificar a todos si la reunión es pública
    if (type === 'public') {
      this.notificationsGateway.notifyAll('public-meeting-created', {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          createdBy: {
            name: user.name,
            email: user.email,
            language: user.language,
          },
          type: meeting.type,
          createdAt: meeting.createdAt,
        },
      });
    }
    // Devuelve el meeting con solo los datos necesarios del usuario creador
    return {
      ...meeting,
      createdBy: {
        name: user.name,
        email: user.email,
        language: user.language,
      },
    };
  }

  // 2. Unirse a una reunión
  async joinMeeting(meetingId: string, userId: string) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
      relations: ['createdBy'],
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Validar tipo de reunión
    if (meeting.type === 'private') {
      const invitation = await this.invitationRepo.findOne({
        where: { meeting, invited: user, accepted: true },
      });
      if (!invitation) throw new ForbiddenException('Invitation required');
    }
    if (meeting.type === 'friends') {
      // solo amigos del creador pueden unirse
      const isFriend = await this.friendshipRepo.findOne({
        where: [
          { requester: meeting.createdBy, addressee: user, accepted: true },
          { requester: user, addressee: meeting.createdBy, accepted: true },
        ],
      });
      if (!isFriend && user.id !== meeting.createdBy.id)
        throw new ForbiddenException('Only friends can join');
    }

    const participant = this.participantRepo.create({
      meeting,
      user,
      joinedAt: new Date(),
      language: user.language,
    });
    const participants = await this.participantRepo.find({
      where: { meeting: { id: meetingId }, leftAt: IsNull() }, // <-- Cambia null por IsNull()
      relations: ['user'],
    });
    for (const p of participants) {
      if (p.user.id !== userId) {
        this.notificationsGateway.notifyUser(p.user.id, 'user-joined', {
          meetingId,
          userIdJoined: userId,
          message: 'A user joined your meeting',
        });
      }
      await this.meetingRepo.update(meetingId, { pendingDeleteAt: null });

      await this.participantRepo.save(participant);

      // Devuelve el meeting con solo los datos necesarios del usuario creador
      return {
        ...meeting,
        createdBy: meeting.createdBy
          ? {
              name: meeting.createdBy.name,
              email: meeting.createdBy.email,
              language: meeting.createdBy.language,
            }
          : null,
      };
    }
  }
  // Listar todas las reuniones públicas o activas
  async listAllMeetings() {
    // Puedes filtrar solo públicas y activas si tienes un campo "active" o similar
    const meetings = await this.meetingRepo.find({
      where: [{ type: 'public' }, { type: 'friends' }],
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      createdBy: {
        name: m.createdBy?.name,
        email: m.createdBy?.email,
        language: m.createdBy?.language,
      },
      createdAt: m.createdAt,
    }));
  }

  // Listar reuniones creadas por un usuario
  async listUserMeetings(userId: string) {
    const meetings = await this.meetingRepo.find({
      where: { createdBy: { id: userId } },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      createdBy: {
        name: m.createdBy?.name,
        email: m.createdBy?.email,
        language: m.createdBy?.language,
      },
      createdAt: m.createdAt,
    }));
  }
  async listFriendsMeetings(userId: string) {
    // Buscar amigos
    const friendships = await this.friendshipRepo.find({
      where: [
        { requester: { id: userId }, accepted: true },
        { addressee: { id: userId }, accepted: true },
      ],
      relations: ['requester', 'addressee'],
    });
    const friendIds = friendships.map((f) =>
      f.requester.id === userId ? f.addressee.id : f.requester.id,
    );
    if (friendIds.length === 0) return [];
    // Buscar reuniones creadas por amigos
    const meetings = await this.meetingRepo.find({
      where: friendIds.map((id) => ({ createdBy: { id } })),
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
    return meetings.map((m) => ({
      id: m.id,
      title: m.title,
      type: m.type,
      createdBy: {
        id: m.createdBy?.id,
        name: m.createdBy?.name,
        email: m.createdBy?.email,
        language: m.createdBy?.language,
      },
      createdAt: m.createdAt,
    }));
  }

  // 3. Salir de una reunión

  async leaveMeeting(meetingId: string, userId: string) {
    const participant = await this.participantRepo.findOne({
      where: { meeting: { id: meetingId }, user: { id: userId } },
    });
    if (participant) {
      participant.leftAt = new Date();
      await this.participantRepo.save(participant);

      // Verifica si quedan participantes activos
      const activeCount = await this.participantRepo.count({
        where: { meeting: { id: meetingId }, leftAt: IsNull() },
      });

      if (activeCount === 0) {
        // Borra la reunión
        await this.meetingRepo.delete(meetingId);
      }
      return participant;
    }
    return null;
  }

  // 4. Ver lista de participantes
  async listParticipants(meetingId: string) {
    const participants = await this.participantRepo.find({
      where: {
        meeting: { id: meetingId },
        leftAt: IsNull(), // <-- Cambia require('typeorm').IsNull() por IsNull()
      },
      relations: ['user'],
    });
    return participants.map((p) => ({
      name: p.user.name,
      email: p.user.email,
      language: p.user.language,
    }));
  }

  // 7. Invitar a reunión privada
  async inviteToMeeting(
    meetingId: string,
    invitedId: string,
    invitedById: string,
  ) {
    const meeting = await this.meetingRepo.findOne({
      where: { id: meetingId },
    });
    if (!meeting || meeting.type !== 'private')
      throw new BadRequestException('Only private meetings require invitation');
    const invited = await this.userRepo.findOne({ where: { id: invitedId } });
    const invitedBy = await this.userRepo.findOne({
      where: { id: invitedById },
    });
    if (!invited) throw new NotFoundException('Invited user not found');
    if (!invitedBy) throw new NotFoundException('Inviter user not found');
    const alreadyInvited = await this.invitationRepo.findOne({
      where: { meeting, invited },
    });
    if (alreadyInvited) throw new BadRequestException('Already invited');
    const invitation = this.invitationRepo.create({
      meeting,
      invited,
      invitedBy,
    });
    return this.invitationRepo.save(invitation);
  }

  // 8. Aceptar invitación
  async acceptMeetingInvitation(invitationId: string, userId: string) {
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, invited: { id: userId } },
      relations: ['meeting', 'meeting.createdBy'],
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    invitation.accepted = true;
    await this.invitationRepo.save(invitation);
    // automáticamente unir al usuario a la reunión
    const meeting = await this.joinMeeting(invitation.meeting.id, userId);
    // meeting ya viene formateado por joinMeeting
    return meeting;
  }

  // Listar invitaciones a reuniones pendientes
  async listPendingInvitations(userId: string) {
    const invitations = await this.invitationRepo.find({
      where: { invited: { id: userId }, accepted: false },
      relations: ['meeting', 'invitedBy'],
    });
    return invitations.map((inv) => ({
      invitationId: inv.id,
      meeting: inv.meeting,
      invitedBy: inv.invitedBy,
      createdAt: inv.createdAt,
    }));
  }
  @Cron(CronExpression.EVERY_MINUTE)
  async cleanPendingMeetings() {
    const now = new Date();
    const meetingsToDelete = await this.meetingRepo.find({
      where: {
        pendingDeleteAt: LessThanOrEqual(now),
      },
    });

    for (const meeting of meetingsToDelete) {
      await this.meetingRepo.delete(meeting.id);
      // Opcional: borra relaciones, notifica, etc.
    }
  }
}
