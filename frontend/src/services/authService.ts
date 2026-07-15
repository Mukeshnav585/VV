import api from './api';
import { User } from '@/types';

interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/signup', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
};
