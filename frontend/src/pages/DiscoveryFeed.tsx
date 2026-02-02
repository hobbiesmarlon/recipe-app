import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { RecipeCard } from '../components/ui/RecipeCard';
import client from '../api/client';

interface RecipeMedia {
  url: string;
  type: 'image' | 'video';
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  images: RecipeMedia[];
}

const DiscoveryFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Latest');
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const newLiked = new Set(likedRecipes);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedRecipes(newLiked);
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        console.log('Fetching recipes from:', client.defaults.baseURL + '/recipes');
        const response = await client.get('/recipes');
        console.log('Raw Backend Response:', response.data);
        
        if (response.data && Array.isArray(response.data.recipes)) {
          console.log(`Found ${response.data.recipes.length} recipes`);
          const mappedRecipes: Recipe[] = response.data.recipes.map((r: any) => {
            // Filter out media without a URL and extract unique media items
            const mediaItems: RecipeMedia[] = r.media
              ? r.media
                  .filter((m: any) => !!m.url)
                  .map((m: any) => ({ url: m.url, type: m.type as 'image' | 'video' }))
              : [];
            
            // Remove duplicates based on URL
            const uniqueMedia = mediaItems.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
            
            const placeholderUrl = 'https://via.placeholder.com/800x600?text=No+Image';

            return {
              id: r.id.toString(),
              title: r.name,
              description: r.description || '',
              meta: `${r.cook_time_minutes || 0} min · ${r.servings || 0} servings`,
              image: uniqueMedia.length > 0 ? uniqueMedia[0].url : placeholderUrl,
              images: uniqueMedia.length > 0 ? uniqueMedia : [{ url: placeholderUrl, type: 'image' }]
            };
          });
          setRecipes(mappedRecipes);
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const tabs = ['Latest', 'Most Viewed', 'Most Liked'];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="pt-2 pb-4 sticky top-0 md:top-14 z-[100] bg-background-light dark:bg-background-dark">
        <PageContainer>
          <div className="flex items-center justify-between md:hidden">
            <div className="w-6"></div>
            <h2 className="text-lg font-bold">Recipes</h2>
            <div className="w-10"></div>
          </div>

          <div className="mt-2 md:mt-0 flex gap-2 px-0 pb-2 overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary hover:bg-primary/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </PageContainer>
      </header>

      <main className="pb-24 md:pb-10">
        <PageContainer className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id}
                  recipe={recipe}
                  isLiked={likedRecipes.has(recipe.id)}
                  onToggleLike={toggleLike}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-rounded text-6xl text-gray-300 mb-4">restaurant_menu</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No recipes found</h3>
              <p className="text-gray-500 max-w-xs">We couldn't find any recipes in the database yet. Why not add one?</p>
            </div>
          )}
        </PageContainer>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default DiscoveryFeed;
