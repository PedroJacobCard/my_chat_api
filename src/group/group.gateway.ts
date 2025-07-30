import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SendGroupMessageDto } from 'src/dto/SendMessageDto';
import { UserGateway } from 'src/user/user.gateway';

interface GroupRequest {
  resolve: (
    value:
      | { message: string; accepted: boolean }
      | PromiseLike<{ message: string; accepted: boolean }>,
  ) => void;
  creatorId: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupGateway {
  @WebSocketServer()
  server?: Server;
  private readonly pendingRequests: Map<number, GroupRequest> = new Map();

  constructor(private readonly userGateway: UserGateway) {}

  async sendGroupRequestWithReply(
    creatorId: number,
    groupName: string,
    toUserId: number,
  ): Promise<{ message: string; accepted: boolean }> {
    const socketId = this.userGateway.getOnlineUsers().get(toUserId);

    if (!socketId) return { message: 'User is not created or Online.', accepted: false };

    this.server?.to(socketId).emit('group_request', { creatorId, groupName });

    return new Promise((resolve) => {
      this.pendingRequests.set(toUserId, { resolve, creatorId });

      setTimeout(() => {
        if (this.pendingRequests.has(toUserId)) {
          this.pendingRequests.delete(toUserId);
          resolve({ message: 'The request reached timeout.', accepted: false });
        }
      }, 20000);
    });
  }

  @SubscribeMessage('group_request_response')
  handleGroupRequestResponse(
    @MessageBody() data: { creatorId: number; accepted: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const toUserId = +client.handshake.auth.userId;
    const request = this.pendingRequests.get(toUserId);

    if (request && request.creatorId === data.creatorId) {
      request.resolve({
        message: `${data.accepted ? 'User accepted the request' : 'User declinned the request'}`,
        accepted: data.accepted,
      });
    }
  }

  @SubscribeMessage('group_message')
  handleMessage(@MessageBody() sendMessageDto: SendGroupMessageDto): void {
    this.server?.emit(`receive_group${sendMessageDto.groupId}_message`, sendMessageDto);
  }
}
