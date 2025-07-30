import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  DeleteUserDto,
  ReturnDeleteUserDto,
  ReturnUpdateUserDto,
  ReturnUsersDto,
  UpdateUserDto,
} from 'src/dto/UserDto';
import { PrismaService } from 'src/prisma/prisma.service';
import { checkPassword } from 'utils/functions';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<ReturnUsersDto[]> {
    try {
      const users = await this.prisma.user.findMany();
      return users.map((user) => {
        return {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
    }
    throw new InternalServerErrorException('Unknown error occurred');
  }

  async updateUser(id: number, updateUser: UpdateUserDto): Promise<ReturnUpdateUserDto> {
    if (!id) throw new BadRequestException('An integer ID must be given.');

    const { password, newPassword, confirmNewPassword, ...updateData } = updateUser;

    const schema = z.object({
      username: z.string().min(4, 'User name must have at least 4 characters.').optional(),
      password: z.string().min(8, 'User password must have at least 8 characters.'),
      newPassword: z.string().min(8, 'User password must have at least 8 characters.').optional(),
      confirmNewPassword: z
        .string()
        .min(8, 'User password must have at least 8 characters.')
        .refine(() => newPassword === confirmNewPassword, {
          message: 'New passwords do not match.',
          path: ['Confirm new password'],
        })
        .optional(),
    });

    const validationResult = schema.safeParse(updateUser);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new NotFoundException('User not found.');

      if (password && !(await checkPassword(password, user.passwordHash)))
        throw new BadRequestException('Passord is incorrect.');

      const passwordHash = newPassword ? await bcrypt.hash(newPassword, 8) : user.passwordHash;
      const updateUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
          ...updateData,
        },
      });

      if (!updateUser) throw new InternalServerErrorException('Wasn`t possible to update User.');

      return {
        id: updateUser.id,
        username: updateUser.username,
        updatedAt: updateUser.updatedAt,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
    }
    throw new InternalServerErrorException('Unknown error occurred');
  }

  async deleteUser(id: number, deleteUserDto: DeleteUserDto): Promise<ReturnDeleteUserDto> {
    if (!id) throw new BadRequestException('An integer ID must be given.');

    const { password } = deleteUserDto;

    const schema = z.object({
      password: z.string().min(8, 'User password must have at least 8 characters.'),
    });

    const validationResult = schema.safeParse(deleteUserDto);

    if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) throw new NotFoundException('No user with this ID was found.');

      if (password && !(await checkPassword(password, user.passwordHash)))
        throw new BadRequestException('Password is incorrect.');

      const deleteUser = await this.prisma.user.delete({
        where: {
          id,
        },
      });

      if (!deleteUser) throw new BadRequestException('Wasn`t possible to delete User');

      return {
        id: deleteUser.id,
        username: deleteUser.username,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
    }
    throw new InternalServerErrorException('Unknown error occurred');
  }
}
