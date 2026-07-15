import api from './api';
import { User } from '@/types';

export const userService = {
  getAll: async (): Promise<{ users: User[] }> => {
    const { data } = await api.get('/api/users');
    return data;
  },

  search: async (q: string): Promise<{ users: User[] }> => {
    const { data } = await api.get('/api/users/search', { params: { q } });
    return data;
  },

  getById: async (id: string): Promise<{ user: User }> => {
    const { data } = await api.get(`/api/users/${id}`);
    return data;
  },
};
