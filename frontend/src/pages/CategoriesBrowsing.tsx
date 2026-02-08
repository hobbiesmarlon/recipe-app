import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';

interface CategoryItem {
  id: number;
  name: string;
}

const MEAL_TYPES: CategoryItem[] = [
  { id: 1, name: 'Breakfast' }, { id: 2, name: 'Lunch' }, { id: 3, name: 'Dinner' },
  { id: 4, name: 'Snack' }, { id: 5, name: 'Appetizer' }, { id: 6, name: 'Dessert' }, { id: 7, name: 'Sauce' },
];

const COOKING_METHODS: CategoryItem[] = [
  { id: 8, name: 'Baking' }, { id: 9, name: 'Frying' }, { id: 10, name: 'Grilling' },
  { id: 11, name: 'Roasting' }, { id: 12, name: 'Slow Cook' }, { id: 13, name: 'No-Cook' },
];

const DIETARY: CategoryItem[] = [
  { id: 14, name: 'Vegetarian' }, { id: 15, name: 'Vegan' }, { id: 16, name: 'Gluten-Free' },
  { id: 17, name: 'Dairy-Free' }, { id: 18, name: 'Low-Carb' },
];

const FLAVOURS: CategoryItem[] = [
  { id: 19, name: 'Sweet' }, { id: 20, name: 'Savory' }, { id: 21, name: 'Spicy' },
  { id: 22, name: 'Sour' }, { id: 23, name: 'Bitter' },
];

const BUDGET_EASE: CategoryItem[] = [
  { id: 24, name: 'Budget Friendly' }, { id: 25, name: 'Beginner Friendly' },
  { id: 26, name: 'Low Effort' }, { id: 27, name: '30 Minutes or Less' },
];

const DRINKS: CategoryItem[] = [
  { id: 28, name: 'Cocktail' }, { id: 29, name: 'Mocktail' }, { id: 30, name: 'Coffee/Tea' },
  { id: 31, name: 'Juice' }, { id: 32, name: 'Milkshake' }, { id: 33, name: 'Smoothiee' },
];

const CategoriesBrowsing: React.FC = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFilter = (id: number) => {
    const newFilters = new Set(selectedIds);
    if (newFilters.has(id)) {
      newFilters.delete(id);
    } else {
      newFilters.add(id);
    }
    setSelectedIds(newFilters);
  };

  const isSelected = (id: number) => selectedIds.has(id);

  const resetFilters = () => {
    setSelectedIds(new Set());
    setSearchTerm('');
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    selectedIds.forEach(id => {
      params.append('category_ids', id.toString());
    });
    
    navigate(`/?${params.toString()}`);
  };

  const FilterButton: React.FC<{ item: CategoryItem }> = ({ item }) => {
    const selected = isSelected(item.id);
    return (
      <button
        onClick={() => toggleFilter(item.id)}
        className={`flex h-10 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
          selected
            ? 'bg-primary/10 ring-2 ring-primary text-primary font-semibold'
            : 'bg-gray-100 dark:bg-white/10 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-white/20'
        }`}
      >
        {item.name}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 md:top-14 z-10 flex items-center bg-background-light dark:bg-background-dark p-4">
        <div className="w-10"></div>
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight">Filter Recipes</h1>
        <button 
          onClick={handleSearch}
          className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-sm transition-colors bg-primary hover:bg-orange-700 disabled:opacity-50"
          disabled={selectedIds.size === 0 && !searchTerm.trim()}
        >
          Search
        </button>
      </header>

      <main className="flex-grow p-4 pb-32 sm:p-6 sm:pb-36">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Ingredient Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark" open>
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">nutrition</span>
                <h2 className="text-lg font-bold">Ingredients</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark">search</span>
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full rounded-full border-gray-200 bg-gray-100 dark:bg-white/10 dark:border-border-dark py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary dark:placeholder-text-muted-dark dark:text-white" 
                  placeholder="Search ingredients..." 
                  type="text" 
                />
              </div>
            </div>
          </details>

          {/* Meal Type Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">restaurant_menu</span>
                <h2 className="text-lg font-bold">Meal Type</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map(item => (
                   <FilterButton key={item.id} item={item} />
                ))}
              </div>
            </div>
          </details>
          
          {/* Cooking Method Card */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">skillet</span>
                <h2 className="text-lg font-bold">Cooking Method</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {COOKING_METHODS.map(item => (
                   <FilterButton key={item.id} item={item} />
                ))}
              </div>
            </div>
          </details>

           {/* Dietary Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">eco</span>
                <h2 className="text-lg font-bold">Dietary</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {DIETARY.map(item => (
                   <FilterButton key={item.id} item={item} />
                ))}
              </div>
            </div>
          </details>

           {/* Flavour Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">local_dining</span>
                <h2 className="text-lg font-bold">Flavour</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {FLAVOURS.map(item => (
                   <FilterButton key={item.id} item={item} />
                ))}
              </div>
            </div>
          </details>
          
           {/* Budget and Ease Card */}
           <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">savings</span>
                <h2 className="text-lg font-bold">Budget and Ease</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {BUDGET_EASE.map(item => (
                   <FilterButton key={item.id} item={item} />
                ))}
              </div>
            </div>
          </details>
          
          {/* Drinks */}
          <details className="group rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0 shadow-subtle dark:shadow-subtle-dark">
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-4 list-none text-background-dark dark:text-background-light">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">local_cafe</span>
                <h2 className="text-lg font-bold">Drinks</h2>
              </div>
              <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-4 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {DRINKS.map(item => (
                   <FilterButton key={item.id} item={item} />
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

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default CategoriesBrowsing;
