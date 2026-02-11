import { create } from 'zustand';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  email?: string;
  username_sourced_from_provider: boolean;
  display_name_sourced_from_provider: boolean;
  profile_pic_sourced_from_provider: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, isLoading: false });
        return;
      }
      const response = await client.get('/users/me');
      set({ user: response.data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If 401, clear token
      // @ts-ignore
      if (error.response?.status === 401) {
          localStorage.removeItem('token');
      }
      set({ user: null, error: 'Failed to fetch user', isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
}));
