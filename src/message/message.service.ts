import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateMessageDto,
  DeleteMessageDto,
  GetMessagesDto,
  MessageDto,
  UpdateMessageDto,
} from 'src/dto/MessageDto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as z from 'zod';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async getAllMessages(
    skip: number,
    take: number,
    getMessagesDto: GetMessagesDto,
  ): Promise<MessageDto[]> {
    if (getMessagesDto.belonger === '' || getMessagesDto.chatOrGroupId === null)
      throw new BadRequestException('Chat or Group data must be provided');

    const schema = z.object({
      belonger: z.string().min(4, 'Too schort'),
      chatOrGroupId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(getMessagesDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    let messages: MessageDto[] = [];

    try {
      switch (getMessagesDto.belonger) {
        case 'chat':
          messages = await this.prisma.message.findMany({
            where: {
              chatId: getMessagesDto.chatOrGroupId,
            },
            skip,
            take,
            orderBy: {
              createdAt: 'desc',
            },
          });
          break;
        case 'group':
          messages = await this.prisma.message.findMany({
            where: {
              groupId: getMessagesDto.chatOrGroupId,
            },
            skip,
            take,
            orderBy: {
              createdAt: 'desc',
            },
          });
          break;
        default:
          throw new BadRequestException('Belonger not identified.');
      }

      if (messages.length === 0) throw new NotFoundException('Messages not found.');

      return messages;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
      throw new InternalServerErrorException('Unknown error ocoured.');
    }
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<MessageDto> {
    if (!createMessageDto || createMessageDto.text === '' || createMessageDto.userId === null)
      throw new BadRequestException('Message data must be provided');

    const schema = z.object({
      userId: z.number().int().positive(),
      chatId: z.number().int().positive().optional(),
      groupId: z.number().int().positive().optional(),
      text: z.string().min(1, 'Text must have at least 1 character.'),
    });

    const validationResult = schema.safeParse(createMessageDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    if (!createMessageDto.groupId && !createMessageDto.chatId)
      throw new BadRequestException('At least a Chat or a Group ID must be provided.');

    const belonger = createMessageDto.chatId ? 'chat' : 'group';
    let message: MessageDto;

    try {
      switch (belonger) {
        case 'chat':
          message = await this.prisma.message.create({
            data: {
              userId: createMessageDto.userId,
              text: createMessageDto.text,
              chatId: createMessageDto.chatId,
            },
          });
          break;
        case 'group':
          message = await this.prisma.message.create({
            data: {
              userId: createMessageDto.userId,
              text: createMessageDto.text,
              groupId: createMessageDto.groupId,
            },
          });
          break;
        default:
          throw new BadRequestException('Belonger not identified.');
      }

      if (!message) throw new NotFoundException('Wasn`t possible to create message.');

      return message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
      throw new InternalServerErrorException('Unknown error ocoured.');
    }
  }

  async updateMessage(id: number, updateMessageDto: UpdateMessageDto): Promise<MessageDto> {
    if (
      !updateMessageDto ||
      updateMessageDto.text === '' ||
      updateMessageDto.userId === null ||
      id === null
    )
      throw new BadRequestException('Message data must be provided');

    const updateData = {
      id,
      ...updateMessageDto,
    };

    const schema = z.object({
      id: z.number().int().positive(),
      userId: z.number().int().positive(),
      chatId: z.number().int().positive().optional(),
      groupId: z.number().int().positive().optional(),
      text: z.string().min(1, 'Text must have at least 1 character.'),
    });

    const validationResult = schema.safeParse(updateData);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    if (!updateMessageDto.groupId && !updateMessageDto.chatId)
      throw new BadRequestException('At least a Chat or a Group ID must be provided.');

    const belonger = updateMessageDto.chatId ? 'chat' : 'group';
    let message: MessageDto;

    try {
      switch (belonger) {
        case 'chat':
          message = await this.prisma.message.update({
            where: {
              id,
              AND: {
                userId: updateMessageDto.userId,
                chatId: updateMessageDto.chatId,
              },
            },
            data: {
              text: updateMessageDto.text,
            },
          });
          break;
        case 'group':
          message = await this.prisma.message.update({
            where: {
              id,
              AND: {
                userId: updateMessageDto.userId,
                groupId: updateMessageDto.groupId,
              },
            },
            data: {
              text: updateMessageDto.text,
            },
          });
          break;
        default:
          throw new BadRequestException('Belonger not identified.');
      }

      if (!message) throw new NotFoundException('Wasn`t possible to update message.');

      return message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
      throw new InternalServerErrorException('Unknown error ocoured.');
    }
  }

  async deleteMessage(id: number, deleteMessageDto: DeleteMessageDto): Promise<MessageDto> {
    if (!deleteMessageDto || deleteMessageDto.userId === null || id === null)
      throw new BadRequestException('Message data must be provided');

    const deleteData = {
      id,
      ...deleteMessageDto,
    };

    const schema = z.object({
      id: z.number().int().positive(),
      userId: z.number().int().positive(),
      chatId: z.number().int().positive().optional(),
      groupId: z.number().int().positive().optional(),
    });

    const validationResult = schema.safeParse(deleteData);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    if (!deleteMessageDto.groupId && !deleteMessageDto.chatId)
      throw new BadRequestException('At least a Chat or a Group ID must be provided.');

    const belonger = deleteMessageDto.chatId ? 'chat' : 'group';
    let message: MessageDto;

    try {
      switch (belonger) {
        case 'chat':
          message = await this.prisma.message.delete({
            where: {
              id,
              AND: {
                userId: deleteMessageDto.userId,
                chatId: deleteMessageDto.chatId,
              },
            },
          });
          break;
        case 'group':
          message = await this.prisma.message.delete({
            where: {
              id,
              AND: {
                userId: deleteMessageDto.userId,
                groupId: deleteMessageDto.groupId,
              },
            },
          });
          break;
        default:
          throw new BadRequestException('Belonger not identified.');
      }

      if (!message) throw new NotFoundException('Wasn`t possible to delete message.');

      return message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
      throw new InternalServerErrorException('Unknown error ocoured.');
    }
  }
}
