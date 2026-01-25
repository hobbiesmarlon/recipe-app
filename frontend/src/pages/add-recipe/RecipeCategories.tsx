import React, { useState } from 'react';
import { Link } from 'react-router';

const RecipeCategories: React.FC = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (category: string, value: string) => {
    const key = `${category}:${value}`;
    const newSelected = new Set(selected);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelected(newSelected);
  };

  const isSelected = (category: string, value: string) => selected.has(`${category}:${value}`);

  const Chip: React.FC<{ category: string; value: string }> = ({ category, value }) => {
    const selected = isSelected(category, value);
    return (
      <button
        onClick={() => toggle(category, value)}
        className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
          selected
            ? 'bg-primary/10 ring-2 ring-primary text-primary font-semibold'
            : 'text-text-light dark:text-text-dark bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
        }`}
      >
        {value}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
          <Link to="/add-recipe/instructions" className="flex items-center justify-center text-primary" aria-label="Back">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </Link>
          <h2 className="text-lg font-bold text-background-dark dark:text-background-light flex-1 text-center">Add Recipe Category</h2>
          <div className="w-8"></div>
        </header>

        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4 border-b border-primary/10" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={4}>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
        </div>
      </div>

      <main className="flex-grow p-4 pb-28 sm:p-6 sm:pb-32">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex flex-col gap-4">
            {/* Meal Type Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Meal Type</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Appetizer', 'Dessert', 'Drink', 'Sauce'].map(item => (
                    <Chip key={item} category="Meal Type" value={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Cooking Method Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">skillet</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Cooking Method</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Baking', 'Frying', 'Grilling', 'Roasting', 'No-Cook', 'Slow Cook', 'Steam'].map(item => (
                    <Chip key={item} category="Cooking Method" value={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Dietary Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">eco</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Dietary</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'].map(item => (
                    <Chip key={item} category="Dietary" value={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Flavour Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_dining</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Flavour</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Sweet', 'Savory', 'Spicy', 'Sour', 'Bitter'].map(item => (
                    <Chip key={item} category="Flavour" value={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Budget and Ease Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">savings</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Budget and Ease</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Budget Friendly', 'Beginner Friendly', 'Low Effort', '30 Minutes or Less'].map(item => (
                    <Chip key={item} category="Budget" value={item} />
                  ))}
                </div>
              </div>
            </details>

            {/*Drinks Section */}
            <details className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_cafe</span>
                  <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">Drinks</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {['Coffee', 'Mocktail', 'Coffee/Tea', 'Juice', 'Milkshake', 'Smoothiee'].map(item => (
                    <Chip key={item} category="Drinks" value={item} />
                  ))}
                </div>
              </div>
            </details>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none">
        <div className="mx-auto max-w-2xl">
          <Link to="/add-recipe/chefs-note" className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0">
            Next Step <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default RecipeCategories;
