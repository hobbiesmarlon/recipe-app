import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { DesktopNav } from '../components/DesktopNav';
import { useAuthStore } from '../store/useAuthStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { fetchUser, user, isLoggingOut } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoggingOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted-light dark:text-text-muted-dark font-medium">Signing out...</p>
        </div>
      </div>
    );
  }

  let themeClass = '';

  if (path.startsWith('/profile') || path.startsWith('/u/') || path.startsWith('/edit-profile') || path.startsWith('/my-recipes')) {
    themeClass = 'theme-profile';
  } else if (path.startsWith('/add-recipe') || path.startsWith('/recipe')) {
    themeClass = 'theme-recipe';
  } else if (path.startsWith('/browse')) {
    themeClass = 'theme-browsing';
  }

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display transition-colors duration-200 flex flex-col ${themeClass}`}>
      <DesktopNav />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
