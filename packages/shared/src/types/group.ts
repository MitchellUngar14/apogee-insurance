// Group types shared across all services

export interface Group {
  id: number;
  groupName: string;
  createdAt: string;
}

export interface CreateGroupRequest {
  groupName: string;
}

export interface UpdateGroupRequest {
  groupName?: string;
}
