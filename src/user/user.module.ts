import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserGateway } from './user.gateway';

@Module({
  controllers: [UserController],
  providers: [UserService, UserGateway],
  imports: [PrismaModule],
  exports: [UserGateway],
})
export class UserModule {}
