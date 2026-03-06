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
  cognito_sub?: string;
}

interface PendingUser {
  email: string;
  cognito_sub: string;
}

interface AuthState {
  user: User | null;
  pendingUser: PendingUser | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  fetchSession: () => Promise<string | null>;
  loginWithCognito: (provider?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  pendingUser: null,
  isLoading: false,
  error: null,

loginWithCognito: async (provider?: string): Promise<boolean> => {
  localStorage.removeItem('token');
  set({ user: null, pendingUser: null });

  try {
    await signInWithRedirect({
      provider: provider === 'google' ? 'Google' : { custom: provider ?? 'Google' },
      options: {
        prompt: 'SELECT_ACCOUNT',  // ← Amplify's native prompt field
      },
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
},

  fetchSession: async () => {
    if (import.meta.env.VITE_USE_COGNITO !== 'true') return null;
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
      
      if (token) {
        localStorage.setItem('token', token);
        await get().fetchUser();
        return token;
      }
      return null;
    } catch (err) {
      return null;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, pendingUser: null, isLoading: false });
        return;
      }
      const response = await client.get('/users/me');
      set({ user: response.data, pendingUser: null, isLoading: false });
    } catch (error: any) {
      // Handle incomplete registration (403)
      if (error.response?.status === 403 && error.response?.data?.detail?.code === "registration_incomplete") {
        set({ 
          user: null, 
          pendingUser: {
            email: error.response.data.detail.email,
            cognito_sub: error.response.data.detail.cognito_sub
          },
          isLoading: false 
        });
        return;
      }

      if (error.response?.status === 401) {
          localStorage.removeItem('token');
      }
      set({ user: null, pendingUser: null, error: 'Failed to fetch user', isLoading: false });
    }
  },
logout: async () => {
  const isCognito = import.meta.env.VITE_USE_COGNITO === 'true';

  if (isCognito) {
    try {
      // Amplify will handle the redirect to VITE_COGNITO_LOGOUT_URI automatically
      await signOut({ global: true });
    } catch (err) {
      console.error('Cognito logout error:', err);
    }
  }

  localStorage.clear();
  sessionStorage.clear();
  set({ user: null, pendingUser: null });

  // Only redirect manually if NOT using Cognito
  if (!isCognito) {
    window.location.href = '/';
  }
},
}));
