import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  imports: [PrismaModule, UserModule],
  exports: [ChatGateway],
})
export class ChatModule {}
