export type GroupParticipantsDto = {
  userId: number;
  groupId: number;
  joinedAt: Date;
};

export type ReturnGroupDto = {
  id: number;
  name: string;
  creatorId: number;
  participants: GroupParticipantsDto[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGroupDto = {
  name: string;
  creatorId: number;
};

export type ReturnCreateGroupDto = {
  id: number;
  name: string;
  createdAt: Date;
};

export type AddParticipantGroupDto = {
  groupId: number;
  creatorId: number;
  groupName: string;
  newParticipantId: number;
};

export type ReturnAddParticipantGroupDto = {
  groupId: number;
  newParticipantId: number;
  joinedAt: Date;
};

export type UpdateGroupDto = {
  id: number;
  name?: string;
  creatorId: number;
};

export type ReturnUpdateGroupDto = {
  id: number;
  name: string;
  creatorId: number;
  updatedAt: Date;
};

export type DeleteParticipantGroupDto = {
  groupId: number;
  creatorId: number;
  participantId: number;
};

export type ReturnDeleteParticipantGroupDto = {
  groupId: number;
  participantId: number;
};

export type DeleteGroupDto = {
  id: number;
  creatorId: number;
};

export type ReturnDeleteGroupDto = {
  id: number;
  name: string;
  creatorId: number;
};
