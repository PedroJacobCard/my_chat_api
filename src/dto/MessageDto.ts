export type MessageDto = {
  id: number;
  text: string;
  userId: number | null;
  chatId: number | null;
  groupId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GetMessagesDto = {
  belonger: string;
  chatOrGroupId: number;
};

export type CreateMessageDto = {
  userId: number;
  chatId: number | null;
  groupId: number | null;
  text: string;
};

export type UpdateMessageDto = {
  userId: number;
  chatId: number | null;
  groupId: number | null;
  text: string;
};

export type DeleteMessageDto = {
  userId: number;
  chatId: number | null;
  groupId: number | null;
};
