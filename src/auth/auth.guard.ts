import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'utils/PublicDecorator';
import { JwtPayloadType } from 'src/types/jwtPayload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not provided.');
    }

    try {
      const payload: JwtPayloadType = await this.jwt.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      if (typeof payload !== 'object' || payload === null || !('sub' in payload)) {
        throw new UnauthorizedException('Invalid token structure.');
      }

      request.user = payload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new UnauthorizedException('Invalid or expired token.', error.message);
      }
      throw new UnauthorizedException('Unkown server error.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
