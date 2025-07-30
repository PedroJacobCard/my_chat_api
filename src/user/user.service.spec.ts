import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { beforeEach, describe, it } from 'node:test';
import { UserDto } from 'src/dto/UserDto';

void describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  void it('should return an array of users', async () => {
    const result: UserDto[] = [
      {
        id: 0,
        username: '',
        passwordHash: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        chats: [],
        groups: [],
      },
    ];

    expect(await service.getAllUsers).toBeDefined(result);
  });
});
