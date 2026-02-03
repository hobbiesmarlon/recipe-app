import React from 'react';
import { Link } from 'react-router';
import BottomNav from '../components/BottomNav';

const SignIn: React.FC = () => {
  const handleLogin = (provider: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    window.location.href = `${apiUrl}/auth/${provider}/login`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="py-4 sticky top-0 md:top-14 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-between">
          <Link to="/" className="p-2 md:hidden">
            <span className="material-symbols-outlined text-primary">close</span>
          </Link>
          <h1 className="text-lg font-bold text-center flex-grow md:ml-0 -ml-10 text-black dark:text-white">Sign In</h1>
          <div className="w-10 md:hidden"></div>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center text-center px-4 mx-auto max-w-2xl flex-grow pb-24">
        <div className="mb-8 p-4 rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-6xl text-primary">lock_open</span>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Welcome to Recipe App</h2>
        <p className="text-base text-black/70 dark:text-white/70 mb-8 max-w-xs mx-auto">
          Sign in to upload, like and save recipes.
        </p>
        
        <div className="w-full max-w-sm space-y-4">
          {/* X (Twitter) Button */}
          <button 
            onClick={() => handleLogin('x')}
            className="w-full bg-black text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <svg className="mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Continue with X
          </button>

          {/* Facebook Button - Disabled/Hidden as backend support is missing */}
          {/* 
          <button className="w-full bg-[#1877F2] text-white font-bold py-3 px-5 rounded-lg flex items-center justify-center hover:bg-[#166fe5] transition-colors">
            <svg className="mr-3 w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
            Continue with Facebook
          </button>
           */}

          <div className="flex items-center w-full my-4">
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
            <span className="flex-shrink mx-4 text-xs text-black/40 dark:text-white/40 uppercase font-bold tracking-wider">or</span>
            <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
          </div>

          {/* Google Button */}
          <button 
            onClick={() => handleLogin('google')}
            className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold py-3 px-5 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="mr-3 w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
