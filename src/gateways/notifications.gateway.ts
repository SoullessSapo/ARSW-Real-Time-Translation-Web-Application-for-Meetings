// notifications.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // Notifica a un usuario específico por su userId
  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
  }

  // Notifica a todos los usuarios conectados
  notifyAll(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  // (Opcional) Cuando un cliente se conecta, lo metes en su propio "room" de userId
  handleConnection(client: any) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(userId);
    }
  }

  // Notifica cuando un usuario se une a una reunión
  notifyUserJoined(userId: string, userName: string) {
    this.notifyUser(userId, 'user-joined', { userName });
  }

  // Notifica cuando un usuario sale de una reunión
  notifyUserLeft(userId: string, userName: string) {
    this.notifyUser(userId, 'user-left', { userName });
  }

  // Notifica una solicitud de amistad
  notifyFriendRequest(userId: string, requesterName: string) {
    this.notifyUser(userId, 'friend-request', { requesterName });
  }

  // Notifica una invitación a reunión
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

  // Notifica a todos sobre una reunión pública creada
  notifyPublicMeetingCreated(meeting: any) {
    this.notifyAll('public-meeting-created', { meeting });
  }
}
