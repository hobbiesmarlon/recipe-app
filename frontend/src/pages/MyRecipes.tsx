import React, { useState } from 'react';
import { Link } from 'react-router';
import BottomNav from '../components/BottomNav';

const MyRecipes: React.FC = () => {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: 'Breakfast Ideas',
      time: '30 min',
      difficulty: 'Easy',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3VAhvxDsk0s_zP5LK4UULTnmbF0PVt6bzCbDlIzDFEDH8NcX48UcH9p3btzkM3rRDFh28RZC2yIg2xacHF1V-5vldpucjt2L4a8inoIg8RRBUd-5852QGPy3EbCzucSmMXIL9MR2Z2GG76Rpi2ep2uL1rrfwjKFr2DGEVoY99uoSL_k6FSGjtQ-7G-MndmwsHtLKblOPCJk1HpSdHyWLAjjPgX1SDWOWY7q3W7UZJPKPR-rUpUhouu_uXpEH5yvr0QvrzGf8HvrI'
    },
    {
      id: 2,
      title: 'Quick Dinners',
      time: '25 min',
      difficulty: 'Medium',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGuWoHpRwfw07lzD-OOW6f7WcXSj0qn0rVEWOM25qO9x2BLMFSsftZf48-41-_7bfrEwu1NE-W7OHY0brgo30Ynx1UXypwDuxdCryigzmTSn13K7pChFkEbm1SYQPtRYXjxVeUXJInf1sK5KB5vp-sIbb6fX6nykWD5NBwlvjhrqPFDuZqT-War-AZMEfx4R4P7nwLPyfJUP6QOY1l7ofErS5iOj_CEyx83WHtBmgrTsWN3EugaHavO1y3l_-EGwj3i6NJXLvnM_8'
    }
  ]);

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      setRecipes(recipes.filter(r => r.id !== id));
    }
  };

  const handleEdit = (title: string) => {
    alert(`Edit (mock) — ${title}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="py-4 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-between relative">
          <Link to="/profile" className="flex items-center gap-3 text-primary z-20 lg:hidden">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
          </Link>
          <span className="font-bold text-black dark:text-white absolute left-0 right-0 text-center pointer-events-none">My Recipes</span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="px-4 space-y-6 mx-auto max-w-2xl pb-32">
        <section className="pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-background-dark dark:text-background-light">Your recipes</h2>
            <Link to="/add-recipe/basic" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-all">+ New</Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
            {recipes.map(recipe => (
              <div key={recipe.id} className="flex flex-col">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm">
                  <img className="h-full w-full object-cover" src={recipe.image} alt={recipe.title} />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="font-bold text-base text-background-dark dark:text-background-light truncate">{recipe.title}</p>
                  <p className="text-xs text-text-muted-dark dark:text-text-muted-light">{recipe.time} • {recipe.difficulty}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleEdit(recipe.title)} className="flex-1 py-1.5 rounded-lg border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(recipe.id, recipe.title)} className="flex-1 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default MyRecipes;
