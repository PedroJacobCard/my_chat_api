import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/auth/constants';
import { JwtPayloadType } from 'src/types/jwtPayload';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server?: Server;
  private olineUsers: Map<number, string> = new Map();

  constructor(private jwt: JwtService) {}

  @SubscribeMessage('users')
  private broadcastOlineUsers() {
    const userIds = Array.from(this.olineUsers.keys());
    this.server?.emit('online_users', userIds);
  }

  async handleConnection(client: Socket) {
    const userId: number = client.handshake.auth.userId as number;
    const token: string = client.handshake.auth.token as string;

    if (!token || !userId) {
      client.disconnect();
      console.error('User ID or token not provided.');
      return;
    }

    try {
      const payload: JwtPayloadType = await this.jwt.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (typeof payload !== 'object' || payload === null || !('sub' in payload)) {
        client.disconnect();
        console.error('Ivalid or no Token provided.');
        return;
      }

      this.olineUsers.set(userId, client.id);
      console.log(`User ${userId} connected with the socket: ${client.id}`);

      this.broadcastOlineUsers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Invalid or expired token.', error.message);
      }
      console.error('Unkown server error.');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.olineUsers.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];

    if (userId) {
      this.olineUsers.delete(userId);
      console.log(`User ${userId} disconnected from socket: ${client.id}`);
    }

    this.broadcastOlineUsers();
  }

  getOnlineUsers(): Map<number, string> {
    return this.olineUsers;
  }
}
