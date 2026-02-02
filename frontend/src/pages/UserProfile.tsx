import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  email?: string;
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

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('myrecipes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const tabs = ['myrecipes', 'savedrecipes', 'history'];
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch User Profile
        const userRes = await client.get('/users/me');
        const userData = userRes.data;
        setUser(userData);

        // Fetch My Recipes
        if (userData && userData.id) {
            const recipesRes = await client.get(`/recipes?author_id=${userData.id}`);
            setMyRecipes(recipesRes.data.recipes || []);
        }
      } catch (error) {
        console.error("Failed to load profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const getRecipeImage = (recipe: Recipe) => {
      const primary = recipe.media.find(m => m.is_primary);
      if (primary) return primary.url;
      if (recipe.media.length > 0) return recipe.media[0].url;
      return 'https://via.placeholder.com/300?text=No+Image';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 md:py-0 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark md:bg-transparent">
        <PageContainer>
          <div className="flex items-center justify-between md:justify-end md:h-10">
            <div className="w-10 md:hidden"></div>
            <h1 className="text-lg font-bold text-background-dark dark:text-background-light md:hidden">Profile</h1>
            
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="More options"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 z-20 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-fadeIn">
                    <div className="flex flex-col py-2">
                      <Link 
                        to="/edit-profile" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit Profile
                      </Link>
                      <Link 
                        to="/my-recipes" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                        My Recipes
                      </Link>
                      <div className="mx-2 my-1 border-t border-border-light dark:border-border-dark" />
                      <button 
                        id="shareProfileBtn"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Share Profile
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </header>
      
      <main className="pb-24">
        <PageContainer className="space-y-6 pt-6 md:pt-4">
          <div className="@container">
            <div className="flex w-full flex-col items-center md:flex-row md:items-end gap-6 md:gap-8">
              <div className="h-32 w-32 md:h-40 md:w-40 shrink-0">
                {user ? (
                   <img 
                      alt={user.display_name} 
                      className="h-full w-full rounded-full object-cover shadow-lg border-4 border-white dark:border-stone-800" 
                      src={user.profile_picture_url || "https://via.placeholder.com/150"} 
                   />
                ) : (
                   <div className="h-full w-full rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse border-4 border-white dark:border-stone-800"></div>
                )}
              </div>
              <div className="flex flex-col items-center md:items-start mb-2">
                {user ? (
                    <>
                        <p className="text-[22px] md:text-3xl font-bold text-background-dark dark:text-background-light">{user.display_name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                        <p className="text-base md:text-lg text-primary">@{user.username || user.email?.split('@')[0]}</p>
                        <svg className="h-3.5 w-3.5 md:h-4 md:w-4 text-background-dark dark:text-background-light" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
                        </svg>
                        </div>
                    </>
                ) : (
                    <div className="w-48 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mt-2"></div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-primary/20 dark:border-primary/30">
            <nav className="flex justify-center md:justify-start gap-8 px-4" role="tablist" aria-label="Profile tabs">
              <button 
                onClick={() => setActiveTab('myrecipes')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'myrecipes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                My Recipes
              </button>
              <button 
                onClick={() => setActiveTab('savedrecipes')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'savedrecipes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                Saved Recipes
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                History
              </button>
            </nav>
          </div>

          <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="min-h-[300px]"
          >
            {activeTab === 'myrecipes' && (
              <div className="animate-fadeIn">
                 {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                             <div key={i} className="flex flex-col gap-3">
                                <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                             </div>
                        ))}
                    </div>
                 ) : myRecipes.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {myRecipes.map(recipe => (
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
                        <p>No recipes created yet.</p>
                        <Link to="/add-recipe" className="text-primary font-bold hover:underline mt-2">Create one now</Link>
                    </div>
                 )}
              </div>
            )}

            {activeTab === 'savedrecipes' && (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                 {/* Empty state for now since backend endpoint is missing */}
                  <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                      <span className="material-symbols-rounded text-4xl mb-2 opacity-50">bookmark_border</span>
                      <p>No saved recipes yet.</p>
                  </div>
              </div>
            )}

            {activeTab === 'history' && (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                   {/* Empty state for now since backend endpoint is missing */}
                   <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
                      <span className="material-symbols-rounded text-4xl mb-2 opacity-50">history</span>
                      <p>No viewing history available.</p>
                  </div>
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

export default UserProfile;