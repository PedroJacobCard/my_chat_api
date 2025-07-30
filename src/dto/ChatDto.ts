export type ChatParticipantsDto = {
  userId: number;
  chatId: number;
};

export type ReturnChatDto = {
  id: number;
  participants: ChatParticipantsDto[];
};

export type CreateChatDto = {
  fromUserId: number;
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
