import React from 'react';
import { NavLink } from 'react-router';
import { PageContainer } from './PageContainer';

export const DesktopNav: React.FC = () => {
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
             <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M240,64V192a16,16,0,0,1-16,16H160a24,24,0,0,0-24,24,8,8,0,0,1-16,0,24,24,0,0,0-24-24H32a16,16,0,0,1-16-16V64A16,16,0,0,1,32,48H88a32,32,0,0,1,32,32v88a8,8,0,0,0,16,0V80a32,32,0,0,1,32-32h56A16,16,0,0,1,240,64Z"></path>
             </svg>
             <span className="text-lg font-bold text-text-light dark:text-text-dark tracking-tight">Recipefy</span>
          </NavLink>

          {/* Search Bar - Lengthened */}
          <div className="flex-1 max-w-xl relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-text-muted-light dark:text-text-muted-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
             </div>
             <input 
               type="text" 
               className="block w-full pl-9 pr-4 py-1.5 rounded-full border-none bg-gray-100 dark:bg-white/5 text-xs text-text-light dark:text-text-dark placeholder-text-muted-light dark:placeholder-text-muted-dark focus:ring-1 focus:ring-primary focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
               placeholder="Search recipes, ingredients..."
             />
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
             <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjF4IBYL2qx1Zz4w-VTiBqLPNeVqbYwLgBfCV_nyEnVAYQ57EGsWmQxIAEFyxmKUgxZDvTyP1w3ynm3A6vF-JGJiRePgFl7mSFANWm_Eu466ilLKDuUihdjuq9pMulKbmP6IsYggE36Y2mYNUdf26X5ZTtjpCwZLLCDef9Do_q3pTY5V3L9u83qxWm05rKI21XfD1Kp0jT0wqiVSAJwvwwO0ITRbFXjFNoTi5bO11kmpK2qpvIWUIYdt00Xba3Wp4ljEYhZmZUxmk" alt="Profile" className="h-full w-full object-cover" />
             </div>
          </NavLink>
        </div>
      </PageContainer>
    </div>
  );
};