import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupGateway } from './group.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [GroupService, GroupGateway],
  controllers: [GroupController],
  imports: [PrismaModule, UserModule],
})
export class GroupModule {}
