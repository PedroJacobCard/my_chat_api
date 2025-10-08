export type SendChatMessageDto = {
  chatId: number;
  user: string;
  message: string;
  messageId: number;
};

export type SendGroupMessageDto = {
  groupId: number;
  user: string;
  message: string;
  messageId: number;
};
