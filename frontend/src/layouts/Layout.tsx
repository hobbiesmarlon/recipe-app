import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

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

  // Update body class for global theme background if needed, 
  // but better to wrap the app content.
  // We apply the class to the main wrapper.

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark font-display transition-colors duration-200 ${themeClass}`}>
      <Outlet />
    </div>
  );
};

export default Layout;
