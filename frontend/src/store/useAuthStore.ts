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
  isAuthenticating: boolean;
  isLoggingOut: boolean;
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
  isAuthenticating: false,
  isLoggingOut: false,
  error: null,

  loginWithCognito: async (provider?: string): Promise<boolean> => {
    localStorage.removeItem('token');
    set({ user: null, pendingUser: null, isAuthenticating: true });

    try {
      await signInWithRedirect({
        provider: provider === 'google' ? 'Google' : { custom: provider ?? 'Google' },
        options: {
          prompt: 'SELECT_ACCOUNT',  // ← Amplify's native prompt field
        },
      });
      // Do not reset isAuthenticating here, as the page is about to redirect
      return true;
    } catch (err) {
      console.error(err);
      set({ isAuthenticating: false });
      return false;
    }
  },

  fetchSession: async () => {
    if (import.meta.env.VITE_USE_COGNITO !== 'true') return localStorage.getItem('token');
    
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
      
      if (token) {
        localStorage.setItem('token', token);
        await get().fetchUser();
        return token;
      }
      // If Cognito session is missing, but we have a token (maybe local/X), return it
      return localStorage.getItem('token');
    } catch (err) {
      // On error, return existing token if any
      return localStorage.getItem('token');
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
    set({ isLoggingOut: true });
    
    // 1. Identify Cognito session
    let hasCognitoSession = false;
    if (import.meta.env.VITE_USE_COGNITO === 'true') {
      try {
        const session = await fetchAuthSession();
        hasCognitoSession = !!(session.tokens?.idToken || session.tokens?.accessToken);
      } catch (err) {
        hasCognitoSession = false;
      }
    }

    // 2. Clear ONLY our custom token first to trigger immediate UI response in protected routes
    localStorage.removeItem('token');
    set({ user: null, pendingUser: null });

    // 3. Robust "At Least" Delay Pattern
    // Ensures the spinner is visible for at least 600ms, but waits longer if tasks take more time.
    const MIN_DELAY = 600;
    const logoutWork = hasCognitoSession ? signOut({ global: true }) : Promise.resolve();
    const delay = new Promise(resolve => setTimeout(resolve, MIN_DELAY));

    try {
      await Promise.all([logoutWork, delay]);
    } catch (err) {
      console.error('Logout error during tasks:', err);
    }

    // 4. Final Cleanup (for X users or if signOut returns/fails)
    localStorage.clear();
    sessionStorage.clear();
    
    // The browser might have already redirected if Cognito signOut triggered it.
    // If we're still here, we perform the manual redirect.
    window.location.href = '/';
  },
}));
