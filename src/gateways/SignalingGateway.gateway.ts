import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// ===== Tipos =====
interface JoinCallPayload {
  meetingId: string;
  meetingName?: string;
  userName?: string;
}

interface OfferPayload {
  meetingId: string;
  toUserId: string;
  sdp: string;
  type: 'offer';
}

interface AnswerPayload {
  meetingId: string;
  toUserId: string;
  sdp: string;
  type: 'answer';
}

interface IceCandidatePayload {
  meetingId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

interface UserMeta {
  id: string;
  name: string;
  socketId: string;
}

// ===== Gateway =====
@WebSocketGateway({
  namespace: '/signal',
  cors: {
    origin: '*',
  },
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SignalingGateway.name);

  // userId -> socketId
  private userSockets = new Map<string, string>();
  // userId -> meta
  private userInfo = new Map<string, UserMeta>();
  // meetingId -> meetingName
  private roomNames = new Map<string, string>();

  // ========= Connection lifecycle =========
  handleConnection(client: Socket) {
    const userId = (client.handshake.query.userId as string) || null;
    const userName = (client.handshake.query.userName as string) || 'Usuario';

    if (!userId) {
      this.logger.warn(`Socket sin userId, desconectando: ${client.id}`);
      client.emit('error', { message: 'userId requerido en el handshake' });
      client.disconnect(true);
      return;
    }

    this.userSockets.set(userId, client.id);
    this.userInfo.set(userId, {
      id: userId,
      name: userName,
      socketId: client.id,
    });

    this.logger.log(`Conectado: ${client.id} (userId: ${userId})`);
  }

  handleDisconnect(client: Socket) {
    for (const [uid, sid] of this.userSockets.entries()) {
      if (sid === client.id) {
        this.userSockets.delete(uid);
        this.userInfo.delete(uid);
        this.logger.log(`Desconectado: ${client.id} (userId: ${uid})`);
        break;
      }
    }
  }

  // ========= Mensajes =========
  @SubscribeMessage('join-call')
  async handleJoinCall(
    @MessageBody() data: JoinCallPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId, meetingName, userName } = data || {};
    if (!meetingId) return;

    const userId = client.handshake.query.userId as string;

    if (meetingName) this.roomNames.set(meetingId, meetingName);
    if (userName && this.userInfo.has(userId)) {
      const meta = this.userInfo.get(userId)!;
      this.userInfo.set(userId, { ...meta, name: userName });
    }

    client.join(meetingId);
    client.to(meetingId).emit('user-joined-call', {
      userId,
      userName: this.userInfo.get(userId)?.name,
    });

    // obtener sockets presentes en la sala
    const socketIds = await this.server.in(meetingId).allSockets();

    const others: Array<{ id: string; name: string }> = [];
    for (const [uid, sid] of this.userSockets.entries()) {
      if (sid !== client.id && socketIds.has(sid)) {
        const meta = this.userInfo.get(uid);
        others.push({ id: uid, name: meta?.name || uid });
      }
    }

    client.emit('existing-participants', {
      users: others,
      meetingName: this.roomNames.get(meetingId) || meetingId,
    });
  }

  @SubscribeMessage('leave-call')
  async handleLeaveCall(
    @MessageBody() data: { meetingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId } = data || {};
    const userId = client.handshake.query.userId as string;
    if (!meetingId) return;

    client.leave(meetingId);
    client.to(meetingId).emit('user-left-call', { userId });
  }

  @SubscribeMessage('webrtc-offer')
  handleWebrtcOffer(
    @MessageBody() payload: OfferPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.handshake.query.userId as string;
    const fromUserName = this.userInfo.get(fromUserId)?.name || fromUserId;
    const { toUserId, sdp, type } = payload;

    const targetSid = this.userSockets.get(toUserId);
    if (!targetSid) return;

    client.to(targetSid).emit('webrtc-offer', {
      fromUserId,
      fromUserName,
      sdp,
      type,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleWebrtcAnswer(
    @MessageBody() payload: AnswerPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.handshake.query.userId as string;
    const fromUserName = this.userInfo.get(fromUserId)?.name || fromUserId;
    const { toUserId, sdp, type } = payload;

    const targetSid = this.userSockets.get(toUserId);
    if (!targetSid) return;

    client.to(targetSid).emit('webrtc-answer', {
      fromUserId,
      fromUserName,
      sdp,
      type,
    });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(
    @MessageBody() payload: IceCandidatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    const fromUserId = client.handshake.query.userId as string;
    const { toUserId, candidate } = payload;

    const targetSid = this.userSockets.get(toUserId);
    if (!targetSid) return;

    client.to(targetSid).emit('webrtc-ice-candidate', {
      fromUserId,
      candidate,
    });
  }
}
