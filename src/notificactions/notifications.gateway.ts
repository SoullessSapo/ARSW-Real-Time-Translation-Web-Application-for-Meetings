import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    // El frontend debe pasar userId como query param al conectar
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected (socketId=${client.id})`);
    } else {
      this.logger.warn('User connected without userId');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Buscar y eliminar el userId que tenía este socket
    for (const [userId, socketId] of this.connectedUsers) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  /**
   * Notifica a un usuario por su userId.
   * @param userId El ID del usuario a notificar
   * @param event El nombre del evento (ej: 'meeting-invitation', 'friend-request')
   * @param payload Datos a enviar (objeto)
   */
  notifyUser(userId: string, event: string, payload: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
      this.logger.log(`Notification sent to user ${userId} (event: ${event})`);
    } else {
      this.logger.warn(
        `User ${userId} is not connected. Could not send ${event}`,
      );
    }
  }
}
