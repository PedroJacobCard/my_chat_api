export type ChatParticipantsDto = {
  userId: number;
  chatId: number;
  username: string;
};

export type ReturnChatDto = {
  id: number;
  participants: ChatParticipantsDto[];
};

export type CreateChatDto = {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
};

export type ReturnCreateChatDto = {
  id: number;
  participants: ChatParticipantsDto[];
};

export type ReturnDeleteChatDto = {
  id: number;
  participants: ChatParticipantsDto[];
};
