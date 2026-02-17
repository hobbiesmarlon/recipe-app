import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  display_name: string;
  profile_picture_url?: string;
}

interface RecipeMedia {
  url: string;
  type: 'image' | 'video';
  is_primary: boolean;
}

interface Recipe {
  id: number;
  name: string;
  media: RecipeMedia[];
}

const PublicProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        
        const userRes = await client.get(`/users/${userId}`);
        const userData = userRes.data;
        setUser(userData);

        // Fetch User's Recipes
        if (userData && userData.id) {
            const recipesRes = await client.get(`/recipes?author_id=${userData.id}`);
            setRecipes(recipesRes.data.recipes || []);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
        setError("User not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getRecipeImage = (recipe: Recipe) => {
      const primary = recipe.media.find(m => m.is_primary);
      if (primary) return primary.url;
      if (recipe.media.length > 0) return recipe.media[0].url;
      return 'https://via.placeholder.com/300?text=No+Image';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-500 mb-6">The user @{username} does not exist.</p>
          <Link to="/" className="text-primary font-bold hover:underline">Go Home</Link>
          <div className="md:hidden fixed bottom-0 left-0 right-0"><BottomNav /></div>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 md:py-0 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark md:bg-transparent">
        <PageContainer>
          <div className="flex items-center justify-between md:justify-end md:h-10">
            <div className="w-10 md:hidden"></div>
            <h1 className="text-lg font-bold text-background-dark dark:text-background-light md:hidden">Profile</h1>
            <div className="w-10"></div>
          </div>
        </PageContainer>
      </header>
      
      <main className="pb-24">
        <PageContainer className="space-y-6 pt-6 md:pt-4">
          <div className="@container">
            <div className="flex w-full flex-col items-center md:flex-row md:items-end gap-6 md:gap-8">
              <div className="h-32 w-32 md:h-40 md:w-40 shrink-0">
                   <img 
                      alt={user.display_name} 
                      className="h-full w-full rounded-full object-cover shadow-lg border-4 border-white dark:border-stone-800" 
                      src={user.profile_picture_url || "https://via.placeholder.com/150"} 
                   />
              </div>
              <div className="flex flex-col items-center md:items-start mb-2">
                    <p className="text-[22px] md:text-3xl font-bold text-background-dark dark:text-background-light">{user.display_name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-base md:text-lg text-primary">@{user.username}</p>
                    </div>
              </div>
            </div>
          </div>

          <div className="border-b border-primary/20 dark:border-primary/30">
            <nav className="flex justify-center md:justify-start gap-8 px-4">
              <button 
                className="flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold border-primary text-primary transition-colors"
              >
                Recipes
              </button>
            </nav>
          </div>

          <div className="min-h-[300px] animate-fadeIn">
                 {recipes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {recipes.map(recipe => (
                        <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="flex flex-col gap-3 group">
                          <div className="aspect-square w-full overflow-hidden rounded-lg">
                            <img 
                                alt={recipe.name} 
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                src={getRecipeImage(recipe)} 
                            />
                          </div>
                          <p className="font-medium text-background-dark dark:text-background-light line-clamp-1">{recipe.name}</p>
                        </Link>
                      ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <p>No recipes uploaded yet.</p>
                    </div>
                 )}
          </div>
        </PageContainer>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default PublicProfile;
