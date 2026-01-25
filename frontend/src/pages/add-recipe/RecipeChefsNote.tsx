import React, { useState } from 'react';
import { Link } from 'react-router';

const RecipeChefsNote: React.FC = () => {
  const [note, setNote] = useState('');

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
          <Link to="/add-recipe/categories" className="flex items-center justify-center text-primary" aria-label="Back">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </Link>
          <h2 className="text-lg font-bold text-background-dark dark:text-background-light flex-1 text-center">Add Chef's Note</h2>
          <div className="w-8"></div>
        </header>

        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4 border-b border-primary/10" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={5}>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
        </div>
      </div>

      <main className="flex-grow p-4 pb-28 sm:p-6 sm:pb-32">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="chefs-note">
              Share a few extra notes about your recipe
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary min-h-[200px] resize-none dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400" 
              id="chefs-note" 
              placeholder="Tips, tricks, or a personal story about this dish"
            ></textarea>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0">
            Publish Recipe <span className="material-symbols-outlined">check</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default RecipeChefsNote;
