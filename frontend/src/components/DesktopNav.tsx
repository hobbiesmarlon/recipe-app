import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { PageContainer } from './PageContainer';
import { useAuthStore } from '../store/useAuthStore';

export const DesktopNav: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim();
      if (query) {
        navigate(`/?search=${encodeURIComponent(query)}`);
      } else {
        navigate('/');
      }
    }
  };

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
    const activeClass = "text-primary font-bold bg-primary/5";
    const inactiveClass = "text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-primary";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <div className="hidden md:block border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark sticky top-0 z-[100]">
      <PageContainer>
        <div className="flex h-14 items-center justify-between gap-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
             <img src="/logo.svg" alt="Recipefy Logo" className="w-8 h-8" />
             <span className="text-lg font-bold text-text-light dark:text-text-dark tracking-tight">Recipefy</span>
          </NavLink>

          {/* Search Bar - Lengthened */}
          <div className="flex-1 max-w-xl relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-text-muted-light dark:text-text-muted-dark group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
             </div>
             <input 
               type="text" 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyDown={handleSearch}
               className="block w-full pl-9 pr-10 py-1.5 rounded-full border-none bg-gray-100 dark:bg-white/5 text-xs text-text-light dark:text-text-dark placeholder-text-muted-light dark:placeholder-text-muted-dark focus:ring-1 focus:ring-primary focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
               placeholder="Search recipes, ingredients..."
             />
             <button 
               onClick={() => navigate('/browse')}
               className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors"
               title="Filters"
             >
                <span className="material-symbols-outlined text-lg">tune</span>
             </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-0.5">
             <NavLink to="/" className={getLinkClass}>
               Recipes
             </NavLink>
             <NavLink to="/categories" className={getLinkClass}>
               Categories
             </NavLink>
             <NavLink to="/add-recipe/basic" className={getLinkClass}>
               Add Recipe
             </NavLink>
          </nav>
          
          <div className="w-px h-5 bg-border-light dark:bg-border-dark mx-0.5"></div>

          <NavLink to="/profile" className="flex-shrink-0">
             <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm flex items-center justify-center bg-gray-100 dark:bg-white/10">
                {user && user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.display_name} className="h-full w-full object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
             </div>
          </NavLink>
        </div>
      </PageContainer>
    </div>
  );
};