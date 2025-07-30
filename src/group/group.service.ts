import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import {
  AddParticipantGroupDto,
  CreateGroupDto,
  DeleteGroupDto,
  DeleteParticipantGroupDto,
  ReturnAddParticipantGroupDto,
  ReturnCreateGroupDto,
  ReturnDeleteGroupDto,
  ReturnDeleteParticipantGroupDto,
  ReturnGroupDto,
  ReturnUpdateGroupDto,
  UpdateGroupDto,
} from 'src/dto/GroupDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupGateway } from 'src/group/group.gateway';
import * as z from 'zod';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private groupGateway: GroupGateway,
  ) {}

  async getAllGroups(id: number): Promise<ReturnGroupDto[]> {
    if (id === null) throw new BadRequestException('Participant ID must be provided.');

    try {
      const groups = await this.prisma.group.findMany({
        where: {
          participants: {
            some: {
              userId: id,
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (!groups) throw new NotFoundException('Wasn`t possible to find groups.');

      return groups.map((group) => {
        return {
          id: group.id,
          name: group.name,
          creatorId: group.creatorId,
          participants: group.participants,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
        };
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }

  async createGroup(createGroupDto: CreateGroupDto): Promise<ReturnCreateGroupDto> {
    if (createGroupDto.name === '' || createGroupDto.creatorId === null)
      throw new BadRequestException('Creator ID and group name must be provided.');

    const schema = z.object({
      name: z.string().min(1, 'At least 1 character mudt be provided.'),
      creatorId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(createGroupDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const group = await this.prisma.group.create({
        data: {
          name: createGroupDto.name,
          creatorId: createGroupDto.creatorId,
          participants: {
            create: {
              user: {
                connect: { id: createGroupDto.creatorId },
              },
            },
          },
        },
      });

      if (!group) throw new NotAcceptableException('Wasn`t possible to create group.');

      return group;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }

  async addParticipant(
    addParticipantGroupDto: AddParticipantGroupDto,
  ): Promise<ReturnAddParticipantGroupDto> {
    if (
      addParticipantGroupDto.groupId === null ||
      addParticipantGroupDto.creatorId === null ||
      addParticipantGroupDto.newParticipantId === null ||
      addParticipantGroupDto.groupName === ''
    )
      throw new BadRequestException(
        'Group ID, creator ID, new participant ID and group name must be provided.',
      );

    const schema = z.object({
      groupId: z.number().int().positive(),
      creatorId: z.number().int().positive(),
      groupName: z.string().min(1, 'At least one character must be provided.'),
      newParticipantId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(addParticipantGroupDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const accept = await this.groupGateway.sendGroupRequestWithReply(
        addParticipantGroupDto.creatorId,
        addParticipantGroupDto.groupName,
        addParticipantGroupDto.newParticipantId,
      );

      if (!accept.accepted) throw new BadRequestException(accept.message);

      const group = await this.prisma.groupParticipants.create({
        data: {
          user: {
            connect: { id: addParticipantGroupDto.newParticipantId },
          },
          group: {
            connect: {
              id: addParticipantGroupDto.groupId,
            },
          },
        },
      });

      if (!group) throw new NotAcceptableException('Wasn`t possible to add participant.');

      return {
        groupId: group.groupId,
        newParticipantId: group.userId,
        joinedAt: group.joinedAt,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }

  async updateGroup(updateGroupDto: UpdateGroupDto): Promise<ReturnUpdateGroupDto> {
    if (updateGroupDto.id === null || updateGroupDto.creatorId === null)
      throw new BadRequestException('Creator ID and group ID must be provided.');

    const schema = z.object({
      id: z.number().int().positive(),
      name: z.string().min(1, 'At least 1 character mudt be provided.').optional(),
      creatorId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(updateGroupDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const group = await this.prisma.group.update({
        where: {
          id: updateGroupDto.id,
        },
        data: {
          name: updateGroupDto.name,
        },
      });

      if (!group) throw new NotAcceptableException('Wasn`t possible to update group.');

      return group;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }

  async deleteGroup(deleteGroupDto: DeleteGroupDto): Promise<ReturnDeleteGroupDto> {
    if (deleteGroupDto.id === null || deleteGroupDto.creatorId === null)
      throw new BadRequestException('Creator ID and group ID must be provided.');

    const schema = z.object({
      id: z.number().int().positive(),
      creatorId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(deleteGroupDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const group = await this.prisma.group.delete({
        where: {
          id: deleteGroupDto.id,
          AND: {
            creatorId: deleteGroupDto.creatorId,
          },
        },
      });

      if (!group) throw new NotAcceptableException('Wasn`t possible to delete group.');

      return group;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }

  async deleteParticipant(
    deleteParticipantGroupDto: DeleteParticipantGroupDto,
  ): Promise<ReturnDeleteParticipantGroupDto> {
    if (
      deleteParticipantGroupDto.groupId === null ||
      deleteParticipantGroupDto.creatorId === null ||
      deleteParticipantGroupDto.participantId === null
    )
      throw new BadRequestException('Group ID, creator ID and participant ID must be provided.');

    const schema = z.object({
      groupId: z.number().int().positive(),
      creatorId: z.number().int().positive(),
      participantId: z.number().int().positive(),
    });

    const validationResult = schema.safeParse(deleteParticipantGroupDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const group = await this.prisma.groupParticipants.delete({
        where: {
          userId_groupId: {
            groupId: deleteParticipantGroupDto.groupId,
            userId: deleteParticipantGroupDto.participantId,
          },
        },
      });

      if (!group) throw new NotAcceptableException('Wasn`t possible to delete participant.');

      return {
        groupId: group.groupId,
        participantId: group.userId,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error occoured.', error.message);
      }
      throw new InternalServerErrorException('An unknown server error occoured.');
    }
  }
}
