export type SendChatMessageDto = {
  chatId: number;
  user: string;
  message: string;
};

export type SendGroupMessageDto = {
  groupId: number;
  user: string;
  message: string;
};
