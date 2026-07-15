import api from './api';
import { AdminStats, Chat, Message, User } from '@/types';

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await api.get('/api/admin/stats');
    return data;
  },

  getUsers: async (): Promise<{ users: User[] }> => {
    const { data } = await api.get('/api/admin/users');
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  },

  getChats: async (): Promise<{ chats: Chat[] }> => {
    const { data } = await api.get('/api/admin/chats');
    return data;
  },

  getChatMessages: async (chatId: string): Promise<{ messages: Message[] }> => {
    const { data } = await api.get(`/api/admin/chats/${chatId}/messages`);
    return data;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/messages/${id}`);
  },
};
