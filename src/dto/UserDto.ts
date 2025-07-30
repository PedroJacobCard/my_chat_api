import { ChatParticipantsDto } from './ChatDto';
import { GroupParticipantsDto } from './GroupDto';
import { MessageDto } from './MessageDto';

export type UserDto = {
  id: number;
  username: string;
  passwordHash: string;
  messages: MessageDto[];
  chats: ChatParticipantsDto[];
  groups: GroupParticipantsDto[];
  createdAt: Date;
  updatedAt: Date;
};

export type ReturnUserDto = {
  id: number;
  username: string;
  access_token: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReturnUsersDto = {
  id: number;
  username: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginDto = {
  username: string;
  password: string;
};

export type CreateUserDto = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type ReturnCreateUserDto = {
  id: number;
  username: string;
  createdAt: Date;
};

export type UpdateUserDto = {
  username?: string;
  password: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export type ReturnUpdateUserDto = {
  id: number;
  username: string;
  updatedAt: Date;
};

export type DeleteUserDto = {
  password: string;
};

export type ReturnDeleteUserDto = {
  id: number;
  username: string;
};
