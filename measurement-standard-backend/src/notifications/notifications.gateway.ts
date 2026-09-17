import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { Notification } from './entities/notification.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;
 
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token;

      if (!token) {
        client.disconnect();

        return;
      }

      const payload =
        await this.jwtService.verifyAsync(token);

      const userId =
        payload.userId ?? payload.sub;

      if (!userId) {
        client.disconnect();

        return;
      }

      client.data.userId = userId;

      const room = `user:${userId}`;

      client.join(room);

      console.log(
        `User ${userId} connected with socket ${client.id}`,
      );

      console.log(
        `Joined room: ${room}`,
      );
    } catch (error) {
      console.error(
        'WebSocket authentication failed:',
        error,
      );

      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(
      `Client disconnected: ${client.id}`,
    );
  }

  sendToUser(
    userId: string,
    notification: any,
  ) {    
    this.server
      .to(`user:${userId}`)
      .emit(
        'notification',
        notification,
      );
  }

  sendToAll(notification: any) {
    
    this.server.emit(
      'notification',
      notification,
    );
  }
}