import api from './api';
import { Chat, Message } from '@/types';

export const chatService = {
  getOrCreate: async (receiverId: string): Promise<{ chat: Chat }> => {
    const { data } = await api.post('/api/chats', { receiverId });
    return data;
  },

  getMyChats: async (): Promise<{ chats: Chat[] }> => {
    const { data } = await api.get('/api/chats');
    return data;
  },
};

export const messageService = {
  getHistory: async (
    chatId: string,
    page = 1,
    limit = 50
  ): Promise<{ messages: Message[]; pagination: any }> => {
    const { data } = await api.get(`/api/messages/${chatId}`, {
      params: { page, limit },
    });
    return data;
  },

  markAsRead: async (chatId: string): Promise<void> => {
    await api.patch(`/api/messages/${chatId}/read`);
  },
};
