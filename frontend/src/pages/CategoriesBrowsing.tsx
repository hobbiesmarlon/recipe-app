import React, { useState } from 'react';
import { Link } from 'react-router';
import BottomNav from '../components/BottomNav';

const CategoriesBrowsing: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (category: string, value: string) => {
    const key = `${category}:${value}`;
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(key)) {
      newFilters.delete(key);
    } else {
      newFilters.add(key);
    }
    setSelectedFilters(newFilters);
  };

  const isSelected = (category: string, value: string) => selectedFilters.has(`${category}:${value}`);

  const resetFilters = () => setSelectedFilters(new Set());

  const FilterButton: React.FC<{ category: string; value: string }> = ({ category, value }) => {
    const selected = isSelected(category, value);
    return (
      <button
        onClick={() => toggleFilter(category, value)}
        className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
          selected
            ? 'bg-primary/10 ring-2 ring-primary text-primary font-semibold'
            : 'bg-gray-100 dark:bg-white/10 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-white/20'
        }`}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex items-center bg-background-light dark:bg-background-dark p-4">
        <Link to="/" className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5">
          <span className="material-symbols-outlined text-primary">close</span>
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Filter Recipes</h1>
        <button 
          className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-colors bg-primary hover:bg-orange-700"
          disabled={selectedFilters.size === 0}
        >
          Search
        </button>
      </header>

      <main className="flex-grow p-4 pb-32 sm:p-6 sm:pb-36">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Ingredient Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">nutrition</span>
                <h2 className="text-lg font-bold">Ingredients</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">search</span>
                <input className="w-full rounded-full border-gray-200 bg-gray-100 dark:bg-white/10 dark:border-border-dark py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary dark:placeholder-text-muted-dark" placeholder="Search ingredients..." type="text" />
              </div>
              <div className="flex flex-wrap gap-2">
              </div>
            </div>
          </details>

          {/* Meal Type Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">restaurant_menu</span>
                <h2 className="text-lg font-bold">Meal Type</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Appetizer', 'Dessert', 'Sauce'].map(item => (
                   <FilterButton key={item} category="Meal Type" value={item} />
                ))}
              </div>
            </div>
          </details>
          
          {/* Cooking Method Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">skillet</span>
                <h2 className="text-lg font-bold">Cooking Method</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Bake', 'Fry', 'Grill', 'Roast', 'Slow Cook', 'No-Cook'].map(item => (
                   <FilterButton key={item} category="Cooking Method" value={item} />
                ))}
              </div>
            </div>
          </details>

           {/* Dietary Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">eco</span>
                <h2 className="text-lg font-bold">Dietary</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb'].map(item => (
                   <FilterButton key={item} category="Dietary" value={item} />
                ))}
              </div>
            </div>
          </details>

           {/* Flavour Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">local_dining</span>
                <h2 className="text-lg font-bold">Flavour</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Sweet', 'Savory', 'Spicy', 'Sour', 'Bitter'].map(item => (
                   <FilterButton key={item} category="Flavour" value={item} />
                ))}
              </div>
            </div>
          </details>
          
           {/* Budget and Ease Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">savings</span>
                <h2 className="text-lg font-bold">Budget and Ease</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Budget Friendly', 'Beginner Friendly', 'Low Effort', '30 Minutes or Less'].map(item => (
                   <FilterButton key={item} category="Budget" value={item} />
                ))}
              </div>
            </div>
          </details>
          
          {/* Drinks */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">local_cafe</span>
                <h2 className="text-lg font-bold">Drinks</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {['Cocktail', 'Mocktail', 'Coffee/Tea', 'Juice', 'Milkshake', 'Smoothie'].map(item => (
                   <FilterButton key={item} category="Drinks" value={item} />
                ))}
              </div>
            </div>
          </details>

          {/* Reset Filters Button (Moved to bottom) */}
          <div className="flex justify-center pt-6">
            <button 
              onClick={resetFilters}
              className="text-sm font-medium text-text-muted-light underline dark:text-text-muted-dark"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default CategoriesBrowsing;
