export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isOnline: boolean;
  lastSeen: string;
  avatar?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: User | string;
  receiverId: string;
  text: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  _id: string;
  chatId: string;
  members: User[];
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface Notification {
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
}

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  totalMessages: number;
  totalChats: number;
  topUsers: Array<{
    _id: string;
    messageCount: number;
    user: { name: string; email: string };
  }>;
}
