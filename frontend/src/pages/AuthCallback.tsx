import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchSession } = useAuthStore();
  const authHandled = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (authHandled.current) return;
      authHandled.current = true;

      const tokenFromUrl = searchParams.get('token');
      const provider = searchParams.get('provider');
      const isNewUser = searchParams.get('is_new_user') === 'true';

      // 🛠️ Custom Local Flow (e.g., from X)
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        
        if (isNewUser) {
          navigate('/edit-profile', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

      // 🚀 AWS Cognito Flow (e.g., from Google)
      if (import.meta.env.VITE_USE_COGNITO === 'true') {
        try {
          const token = await fetchSession();
          if (token) {
            const { pendingUser } = useAuthStore.getState();
            if (pendingUser) {
              navigate('/edit-profile', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            navigate('/signin', { replace: true });
          }
        } catch (err: any) {
          navigate('/signin', { replace: true });
        }
      } else {
        navigate('/signin', { replace: true });
      }
    };

    handleAuth();
  }, [searchParams, navigate, fetchSession]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-muted-light dark:text-text-muted-dark font-medium">Signing in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
