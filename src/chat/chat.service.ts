import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto, ReturnChatDto, ReturnCreateChatDto } from 'src/dto/ChatDto';
import { SendChatMessageDto } from 'src/dto/SendMessageDto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as z from 'zod';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  private messages: SendChatMessageDto[] = [];

  saveMessage(message: SendChatMessageDto): SendChatMessageDto {
    this.messages.push(message);
    return message;
  }

  getMessages(): SendChatMessageDto[] {
    return this.messages;
  }

  async getAllChats(id: number): Promise<ReturnChatDto[]> {
    if (!id) throw new BadRequestException('ID must be provided.');

    try {
      const chats = await this.prisma.chat.findMany({
        where: {
          participants: {
            some: {
              userId: id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!chats) throw new NotFoundException('Chats not founded.');

      return chats.map((chat) => {
        return {
          id: chat.id,
          participants: chat.participants,
        };
      });
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      throw new InternalServerErrorException('Unknown server error ocoured.');
    }
  }

  async createChat(createChatDto: CreateChatDto): Promise<ReturnCreateChatDto> {
    if (createChatDto.toUserId === null || createChatDto.fromUserId === null)
      throw new BadRequestException('Users ID must be provided.');

    const schema = z.object({
      fromUserId: z.number().int().positive(),
      toUserId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(createChatDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const accept = await this.gateway.sendChatRequestWithReply(
        createChatDto.toUserId,
        createChatDto.fromUserId,
      );

      const createData = [createChatDto.fromUserId, createChatDto.toUserId];

      if (accept.accepted !== true) throw new BadRequestException(accept.message);

      const chat = await this.prisma.chat.create({
        data: {
          participants: {
            create: createData.map((userId) => ({
              user: { connect: { id: userId } },
            })),
          },
        },
        include: {
          participants: true,
        },
      });

      if (!chat) throw new NotFoundException('Chat not founded.');

      return chat;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      throw new InternalServerErrorException('Unknown server error ocoured.');
    }
  }

  async deleteChat(id: number): Promise<ReturnCreateChatDto> {
    if (!id) throw new BadRequestException('Chat ID must be provided.');

    const schema = z.number().int().positive();

    const validationResult = schema.safeParse(id);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const chat = await this.prisma.chat.delete({
        where: {
          id,
        },
        include: {
          participants: true,
        },
      });

      if (!chat) throw new NotFoundException('Chat not founded.');

      return chat;
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      throw new InternalServerErrorException('Unknown server error ocoured.');
    }
  }
}
