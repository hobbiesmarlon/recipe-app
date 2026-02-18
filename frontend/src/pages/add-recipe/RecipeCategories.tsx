import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AddRecipeNavigation } from '../../components/forms/AddRecipeNavigation';
import { useAddRecipeStore } from '../../store/useAddRecipeStore';

interface CategoryItem {
  id: number;
  name: string;
}

const MEAL_TYPES: CategoryItem[] = [
  { id: 1, name: 'Breakfast' }, { id: 2, name: 'Lunch' }, { id: 3, name: 'Dinner' },
  { id: 4, name: 'Snack' }, { id: 5, name: 'Appetizer' }, { id: 6, name: 'Dessert' }, { id: 7, name: 'Sauce' },
  { id: 55, name: 'Condiment' }, { id: 56, name: 'Salad' },
];

const COOKING_METHODS: CategoryItem[] = [
  { id: 8, name: 'Baking' }, { id: 9, name: 'Frying' }, { id: 10, name: 'Grilling' },
  { id: 11, name: 'Roasting' }, { id: 12, name: 'Slow Cook' }, { id: 13, name: 'No-Cook' },
];

const DIETARY: CategoryItem[] = [
  { id: 14, name: 'Vegetarian' }, { id: 15, name: 'Vegan' }, { id: 16, name: 'Gluten-Free' },
  { id: 17, name: 'Dairy-Free' }, { id: 18, name: 'Low-Carb' }, { id: 57, name: 'Fruit-Based' },
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

const RecipeCategories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, setCategories } = useAddRecipeStore();
  
  // Track open state manually to prevent auto-collapse on re-render
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: number) => {
    if (categories.includes(id)) {
      setCategories(categories.filter(c => c !== id));
    } else {
      setCategories([...categories, id]);
    }
  };

  const isSelected = (id: number) => categories.includes(id);

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const Chip: React.FC<{ item: CategoryItem }> = ({ item }) => {
    const selected = isSelected(item.id);
    return (
      <button
        onClick={() => toggleCategory(item.id)}
        className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 text-sm font-medium transition-colors ${
          selected
            ? 'bg-primary/10 ring-2 ring-primary text-primary font-semibold'
            : 'text-text-light dark:text-text-dark bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20'
        }`}
      >
        {item.name}
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 md:top-14 z-20 bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
          <Link to="/add-recipe/instructions" className="flex items-center justify-center text-primary lg:hidden" aria-label="Back">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </Link>
          <div className="hidden lg:block w-8"></div>
          <h2 className="text-lg font-bold text-background-dark dark:text-background-light flex-1 text-center">Add Recipe Category</h2>
          <div className="w-8"></div>
        </header>

        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={4}>
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
            <details 
              open={openSections['Meal Type']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Meal Type': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                  <p className="text-base font-medium leading-normal">Meal Type</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {MEAL_TYPES.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Cooking Method Section */}
            <details 
              open={openSections['Cooking Method']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Cooking Method': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">skillet</span>
                  <p className="text-base font-medium leading-normal">Cooking Method</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {COOKING_METHODS.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Dietary Section */}
            <details 
              open={openSections['Dietary']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Dietary': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">eco</span>
                  <p className="text-base font-medium leading-normal">Dietary</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {DIETARY.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Flavour Section */}
            <details 
              open={openSections['Flavour']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Flavour': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_dining</span>
                  <p className="text-base font-medium leading-normal">Flavour</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {FLAVOURS.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Budget and Ease Section */}
            <details 
              open={openSections['Budget']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Budget': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">savings</span>
                  <p className="text-base font-medium leading-normal">Budget and Ease</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {BUDGET_EASE.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

            {/* Drinks Section */}
            <details 
              open={openSections['Drinks']} 
              onToggle={(e) => setOpenSections(prev => ({ ...prev, 'Drinks': (e.target as HTMLDetailsElement).open }))}
              className="flex flex-col rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-background-dark dark:text-background-light">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">local_cafe</span>
                  <p className="text-base font-medium leading-normal">Drinks</p>
                </div>
                <span className="material-symbols-outlined text-primary group-open:rotate-180 transition-transform duration-300">expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1">
                <div className="flex gap-2 flex-wrap">
                  {DRINKS.map(item => (
                    <Chip key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </details>

          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none lg:hidden">
        <div className="mx-auto max-w-2xl">
          <Link to="/add-recipe/chefs-note" className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0">
            Next Step <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </footer>

      <AddRecipeNavigation 
        onNext={() => navigate('/add-recipe/chefs-note')}
        backPath="/add-recipe/instructions"
      />
    </div>
  );
};

export default RecipeCategories;