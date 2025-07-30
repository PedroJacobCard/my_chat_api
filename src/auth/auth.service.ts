import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import z from 'zod';
import { LoginDto, ReturnUserDto } from '../dto/UserDto';
import { PrismaService } from '../prisma/prisma.service';
import { checkPassword } from 'utils/functions';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signIn(logingDto: LoginDto): Promise<ReturnUserDto> {
    const { username, password } = logingDto;

    const schema = z.object({
      username: z.string().min(4, 'User name must be greater than 3 Characters.'),
      password: z.string().min(8, 'Password is too short.'),
    });

    const validationResult = schema.safeParse(logingDto);

    if (!validationResult.success) {
      throw new BadRequestException(validationResult.error.message);
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) throw new NotFoundException('User not found. Have you speld the username right?');

      if ((password && !(await checkPassword(password, user.passwordHash))) || password === '') {
        throw new BadRequestException('Password is incorrect.');
      }

      const { id, createdAt, updatedAt } = user;

      const payload = { sub: user.id, username: user.username };

      return {
        id,
        username,
        access_token: await this.jwt.signAsync(payload),
        createdAt,
        updatedAt,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new InternalServerErrorException('An server error ocoured.', error.message);
      }
    }
    throw new InternalServerErrorException('Unknown error occurred');
  }
}
