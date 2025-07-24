// gateways/notifications.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  // Al conectarse un cliente lo metemos a un room con su userId
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string | undefined;
    if (userId) client.join(userId);
  }

  // Utils
  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
  }
  notifyAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  // ---- Eventos específicos ----
  notifyPublicMeetingCreated(meeting: any) {
    this.notifyAll('public-meeting-created', { meeting });
  }

  notifyMeetingDeleted(meetingId: string, title: string) {
    this.notifyAll('meeting-deleted', { meetingId, title });
  }

  notifyUserJoined(userId: string, payload: any) {
    this.notifyUser(userId, 'user-joined', payload);
  }

  notifyUserLeft(userId: string, payload: any) {
    this.notifyUser(userId, 'user-left', payload);
  }

  notifyFriendRequest(userId: string, requesterName: string) {
    this.notifyUser(userId, 'friend-request', { requesterName });
  }

  notifyFriendAccepted(userId: string, friendName: string) {
    this.notifyUser(userId, 'friend-accepted', { friendName });
  }

  notifyMeetingInvitation(
    userId: string,
    invitedByName: string,
    meetingTitle: string,
  ) {
    this.notifyUser(userId, 'meeting-invitation', {
      invitedByName,
      meetingTitle,
    });
  }
}
