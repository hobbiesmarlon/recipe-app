import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Toast } from '../components/ui/Toast';

interface Recipe {
  id: number;
  name: string;
  cook_time_minutes: number;
  media: { url: string; is_primary: boolean }[];
}

const MyRecipes: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toast, setToast] = useState<{message: string, isVisible: boolean} | null>(null);

  const fetchRecipes = async (pageNum: number, isNew: boolean) => {
    if (!user) return;
    try {
      if (isNew) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await client.get(`/recipes`, {
        params: {
          author_id: user.id,
          page: pageNum,
          per_page: 12
        }
      });

      const fetchedRecipes = res.data.recipes || [];
      const total = res.data.total;

      if (isNew) {
        setRecipes(fetchedRecipes);
      } else {
        setRecipes(prev => [...prev, ...fetchedRecipes]);
      }

      const currentCount = isNew ? fetchedRecipes.length : recipes.length + fetchedRecipes.length;
      setHasMore(currentCount < total);

    } catch (error) {
      console.error("Failed to fetch recipes", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRecipes(1, true);
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage, false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      try {
        await client.delete(`/recipes/${id}`);
        setRecipes(recipes.filter(r => r.id !== id));
        setToast({ message: "Recipe deleted successfully", isVisible: true });
      } catch (error) {
        console.error("Delete failed", error);
        setToast({ message: "Failed to delete recipe", isVisible: true });
      }
    }
  };

  const handleEdit = (id: number) => {
     // For now, redirect to recipe details as editing is complex
     navigate(`/recipe/${id}`);
  };

  const getImageUrl = (recipe: Recipe) => {
    const primary = recipe.media?.find(m => m.is_primary);
    if (primary) return primary.url;
    if (recipe.media?.length > 0) return recipe.media[0].url;
    return 'https://via.placeholder.com/300?text=No+Image';
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="py-4 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-between relative">
          <Link to="/profile" className="flex items-center gap-3 text-primary z-20 lg:hidden">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </Link>
          <span className="font-bold text-black dark:text-white absolute left-0 right-0 text-center pointer-events-none md:hidden">My Recipes</span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="px-4 space-y-6 mx-auto max-w-2xl pb-32">
        <section className="pt-6">
          <div className="flex items-center justify-between md:hidden">
            <h2 className="text-lg font-bold text-background-dark dark:text-background-light">
              {recipes.length > 0 ? `${recipes.length} Recipes` : 'Your recipes'}
            </h2>
            <Link to="/add-recipe/basic" className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">add</span> New
            </Link>
          </div>

          {loading ? (
             <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="flex flex-col gap-2">
                   <div className="aspect-square w-full rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                   <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                 </div>
               ))}
             </div>
          ) : recipes.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="flex flex-col group cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 shadow-sm relative">
                      <img 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        src={getImageUrl(recipe)} 
                        alt={recipe.name} 
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="font-bold text-base text-background-dark dark:text-background-light truncate">{recipe.name}</p>
                      <p className="text-xs text-text-muted-dark dark:text-text-muted-light">
                         {recipe.cook_time_minutes} min
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => navigate(`/edit-recipe/${recipe.id}/basic`)} className="flex-1 py-1.5 rounded-lg border border-primary/20 text-primary text-xs font-bold hover:bg-primary/5 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(recipe.id, recipe.name)} className="flex-1 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-5 py-2 rounded-full bg-surface-light dark:bg-surface-dark border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                       <>
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                         Loading...
                       </>
                    ) : (
                       'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-center">
               <span className="material-symbols-rounded text-6xl text-gray-300 mb-4">restaurant_menu</span>
               <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No recipes yet</h3>
               <p className="text-gray-500 max-w-xs mb-6">Create your first recipe to see it here.</p>
               <Link to="/add-recipe/basic" className="rounded-full bg-primary px-6 py-3 text-white font-bold shadow-lg hover:bg-orange-600 transition-colors">
                 Create Recipe
               </Link>
             </div>
          )}
        </section>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => prev ? { ...prev, isVisible: false } : null)} 
        />
      )}
    </div>
  );
};

export default MyRecipes;
