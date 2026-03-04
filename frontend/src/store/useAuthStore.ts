import { create } from 'zustand';
import client from '../api/client';
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';

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
  fetchSession: () => Promise<void>;
  loginWithCognito: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  loginWithCognito: async () => {
    try {
      // This redirects to the Cognito Hosted UI / Social Provider
      await signInWithRedirect();
    } catch (err) {
      console.error('Cognito login error:', err);
    }
  },

  fetchSession: async () => {
    // Only attempt if Cognito is enabled
    if (import.meta.env.VITE_USE_COGNITO !== 'true') return;
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (token) {
        // Sync Cognito token to local storage so the API client can use it
        localStorage.setItem('token', token);
        await get().fetchUser();
      }
    } catch (err) {
      console.log('No active Cognito session');
    }
  },

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
      // @ts-ignore
      if (error.response?.status === 401) {
          localStorage.removeItem('token');
      }
      set({ user: null, error: 'Failed to fetch user', isLoading: false });
    }
  },

  logout: async () => {
    if (import.meta.env.VITE_USE_COGNITO === 'true') {
      try {
        await signOut();
      } catch (err) {
        console.error('Cognito logout error:', err);
      }
    }
    localStorage.removeItem('token');
    set({ user: null });
  },
}));
