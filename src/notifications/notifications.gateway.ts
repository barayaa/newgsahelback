import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'https://grenier-sahel.org', 'https://illimi.ai'],
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    client.join(`user-${userId}`);
    return { event: 'joined', data: `Room user-${userId}` };
  }

  sendToUser(userId: number, event: string, data: any) {
    this.server.to(`user-${userId}`).emit(event, data);
  }

  broadcastNotification(userId: number, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }
}
