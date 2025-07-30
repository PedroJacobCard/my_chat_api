import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, ReturnCreateUserDto } from 'src/dto/UserDto';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  getPort(): number {
    return this.configService.get<number>('PORT') ?? 3000;
  }

  async register(createUserDto: CreateUserDto): Promise<ReturnCreateUserDto> {
    const { username, password, confirmPassword } = createUserDto;

    try {
      const schema = z.object({
        username: z.string().min(4, 'User name must have at least 4 characters.'),
        password: z.string().min(8, 'Password must have at least 8 characters.'),
        confirmPassword: z.string().refine(() => password === confirmPassword, {
          message: 'Passwords do not match.',
          path: ['Confirm password'],
        }),
      });

      const validationResult = schema.safeParse(createUserDto);

      if (!validationResult.success) throw new BadRequestException(validationResult.error.message);

      if (password !== confirmPassword) throw new BadRequestException('Passwords do not match.');

      const passwordHash = await bcrypt.hash(password, 8);

      const user = await this.prisma.user.create({
        data: {
          username,
          passwordHash,
        },
      });

      if (!user) throw new NotFoundException('User not found');

      const { id, createdAt } = user;

      return { id, username, createdAt };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
    }
    throw new InternalServerErrorException('Unknown error occurred');
  }
}
