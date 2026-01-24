import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { DesktopNav } from '../components/DesktopNav';

const Layout: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let themeClass = '';

  if (path.startsWith('/profile') || path.startsWith('/edit-profile') || path.startsWith('/my-recipes')) {
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
