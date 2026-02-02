import React from 'react';
import { NavLink } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';

const BottomNav: React.FC = () => {
  const { user } = useAuthStore();

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "flex flex-col items-center justify-end flex-1 gap-1 text-xs font-medium";
    const activeClass = "text-primary font-bold";
    const inactiveClass = "text-text-muted-light dark:text-text-muted-dark hover:text-primary dark:hover:text-primary";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pb-safe">
      <nav className="mx-auto max-w-2xl flex h-20 items-center justify-around px-4">
        <NavLink to="/" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M240,64V192a16,16,0,0,1-16,16H160a24,24,0,0,0-24,24,8,8,0,0,1-16,0,24,24,0,0,0-24-24H32a16,16,0,0,1-16-16V64A16,16,0,0,1,32,48H88a32,32,0,0,1,32,32v88a8,8,0,0,0,16,0V80a32,32,0,0,1,32-32h56A16,16,0,0,1,240,64Z"></path>
              </svg>
              <p>Recipes</p>
            </>
          )}
        </NavLink>
        <NavLink to="/categories" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"></path>
              </svg>
              <p>Categories</p>
            </>
          )}
        </NavLink>
        <NavLink to="/add-recipe/basic" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
              <p>Add</p>
            </>
          )}
        </NavLink>
        <NavLink to="/browse" className={getLinkClass}>
          {({ isActive }) => (
            <>
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
              <p>Search</p>
            </>
          )}
        </NavLink>
        <NavLink to="/profile" className={getLinkClass}>
          {({ isActive }) => (
            <>
              {user && user.profile_picture_url ? (
                  <div className={`h-6 w-6 rounded-full overflow-hidden border ${isActive ? 'border-primary' : 'border-transparent'}`}>
                    <img src={user.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
                  </div>
              ) : (
                <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
              )}
              <p>Profile</p>
            </>
          )}
        </NavLink>
      </nav>
    </footer>
  );
};

export default BottomNav;
