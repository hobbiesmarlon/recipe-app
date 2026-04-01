import React, { useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { DesktopNav } from '../components/DesktopNav';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '../components/PageContainer';

const Layout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { fetchSession, user, isLoggingOut } = useAuthStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="hidden lg:block py-6 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
        <PageContainer>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted-light dark:text-text-muted-dark font-medium">
            <div>
              &copy; {new Date().getFullYear()} Recipefy.
            </div>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
};

export default Layout;
