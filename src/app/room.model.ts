export interface Room {
  _id: string;
  id?: number; // For backward compatibility
  name: string;
  description?: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  participants: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: 'participant' | 'observer' | 'moderator';
    joinedAt: string;
  }>;
  isActive: boolean;
  isPrivate: boolean;
  isCompleted?: boolean;
  inviteCode?: string;
  settings: {
    cardSet: string[];
    allowObservers: boolean;
    autoReveal: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
  tags?: string[];
}