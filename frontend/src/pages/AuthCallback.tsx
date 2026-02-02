import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optional: Fetch user details here if needed, or rely on subsequent API calls
      navigate('/', { replace: true });
    } else {
      // Handle error or missing token
      navigate('/signin', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
