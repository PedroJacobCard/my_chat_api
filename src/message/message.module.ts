import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [MessageService],
  controllers: [MessageController],
  imports: [PrismaModule, ChatModule],
})
export class MessageModule {}
