import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from 'src/dto/MessageDto';
import { SendChatMessageDto } from 'src/dto/SendMessageDto';
import { UserGateway } from 'src/user/user.gateway';

interface ChatRequest {
  resolve: (
    value:
      | { message: string; accepted: boolean }
      | PromiseLike<{ message: string; accepted: boolean }>,
  ) => void;
  fromUserId: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server?: Server;
  private readonly pendingRequests = new Map<number, ChatRequest>();

  constructor(private readonly userGateway: UserGateway) {}

  async sendChatRequestWithReply(
    toUserId: number,
    fromUserId: number,
    fromUserName: string,
  ): Promise<{ message: string; accepted: boolean }> {
    const socketId = this.userGateway.getOnlineUsers().get(toUserId);

    if (!socketId) return { message: 'User is not created or connected', accepted: false };

    this.server?.to(socketId).emit('chat_request', { fromUserId, fromUserName });

    return new Promise((resolve) => {
      this.pendingRequests.set(toUserId, { resolve, fromUserId });

      setTimeout(() => {
        if (this.pendingRequests.has(toUserId)) {
          this.pendingRequests.delete(toUserId);
          resolve({ message: 'The request reached timeout.', accepted: false });
        }
      }, 20000);
    });
  }

  @SubscribeMessage('chat_request_response')
  handleChatRequestResponse(
    @MessageBody() data: { fromUserId: number; accepted: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const toUserId = +client.handshake.auth.userId;
    const request = this.pendingRequests.get(toUserId);

    if (request && request.fromUserId === data.fromUserId) {
      this.pendingRequests.delete(toUserId);
      request.resolve({
        message: `${data.accepted ? 'User accepted the request.' : 'User did not accept the request.'}`,
        accepted: data.accepted,
      });
    }
  }

  @SubscribeMessage('chat_message')
  handleMessage(@MessageBody() sendMessageDto: SendChatMessageDto): void {
    this.server!.emit(`receive_chat${sendMessageDto.chatId}_message`, sendMessageDto);
  }

  handleChangeUpdatedMessage(MessageDto: MessageDto) {
    this.server?.emit(`chat${MessageDto.chatId}_message_update`, { MessageDto });
  }
}
