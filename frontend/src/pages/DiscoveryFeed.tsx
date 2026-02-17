import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { RecipeCard } from '../components/ui/RecipeCard';
import { Toast } from '../components/ui/Toast';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const activeTab = searchParams.get('sort') || 'latest';
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [shareToast, setShareToast] = useState({ visible: false, message: '' });
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleTabChange = (tabValue: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (tabValue === 'latest') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', tabValue);
    }
    setSearchParams(newParams);
  };

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      setShowAuthToast(true);
      return;
    }
    
    const isCurrentlyLiked = likedRecipes.has(id);
    const newLiked = new Set(likedRecipes);
    
    if (isCurrentlyLiked) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedRecipes(newLiked);

    try {
        if (isCurrentlyLiked) {
            await client.delete(`/recipes/${id}/like`);
        } else {
            await client.post(`/recipes/${id}/like`);
        }
    } catch (error) {
        console.error('Failed to toggle like', error);
        setLikedRecipes(likedRecipes); // Revert on error
    }
  };

  const fetchRecipes = async (pageNum: number, isNewSearch: boolean) => {
    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      // Pass all search params directly to the API
      const params = new URLSearchParams(searchParams);
      params.set('sort_by', activeTab);
      params.set('page', pageNum.toString());

      const response = await client.get('/recipes', { 
        params 
      });
      
      console.log('Raw Backend Response:', response.data);
      
      if (response.data && Array.isArray(response.data.recipes)) {
        const fetchedRecipes = response.data.recipes;
        console.log(`Found ${fetchedRecipes.length} recipes`);
        
        // Update hasMore based on whether we received fewer items than requested (default 12)
        // Or strictly if current count < total
        const total = response.data.total;
        const currentCount = isNewSearch ? fetchedRecipes.length : recipes.length + fetchedRecipes.length;
        
        // If we got fewer recipes than the page limit (12), we've reached the end
        const isEndReached = fetchedRecipes.length < 12 || currentCount >= total;
        setHasMore(!isEndReached);

        const likedSet = isNewSearch ? new Set<string>() : new Set(likedRecipes);
        
        const mappedRecipes: Recipe[] = fetchedRecipes.map((r: any) => {
          if (r.is_liked) {
              likedSet.add(r.id.toString());
          }

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

        if (isNewSearch) {
          setRecipes(mappedRecipes);
        } else {
          setRecipes(prev => [...prev, ...mappedRecipes]);
        }
        setLikedRecipes(likedSet);
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Effect for initial load or search/tab change
  useEffect(() => {
    setPage(1);
    fetchRecipes(1, true);
  }, [searchParams, activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage, false);
  };

  const handleShare = (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    e.preventDefault();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Use the backend share endpoint which provides OG tags
    const shareUrl = `${apiUrl}/share/recipe/${recipe.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: shareUrl,
      }).catch((err) => {
          console.error("Error sharing:", err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareToast({ visible: true, message: 'Share link copied to clipboard!' });
      }).catch(() => {
        setShareToast({ visible: true, message: 'Failed to copy link' });
      });
    }
  };

  const tabs = [
    { label: 'Latest', value: 'latest' },
    { label: 'Most Viewed', value: 'most_viewed' },
    { label: 'Most Liked', value: 'most_liked' }
  ];

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
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex-shrink-0 ${
                  activeTab === tab.value
                    ? 'bg-primary text-white'
                    : 'bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary hover:bg-primary/30'
                }`}
              >
                {tab.label}
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id}
                    recipe={recipe}
                    isLiked={likedRecipes.has(recipe.id)}
                    onToggleLike={toggleLike}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    onShare={handleShare}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pt-6">
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
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No recipes found</h3>
              <p className="text-gray-500 max-w-xs">We couldn't find any recipes matching this search. Why not add one?</p>
            </div>
          )}
        </PageContainer>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>

      <Toast 
        isVisible={showAuthToast}
        message="Sign in to like recipes"
        onClose={() => setShowAuthToast(false)}
        action={{
          label: "Sign In",
          onClick: () => navigate('/signin')
        }}
      />
      
      <Toast 
        isVisible={shareToast.visible}
        message={shareToast.message}
        onClose={() => setShareToast({ ...shareToast, visible: false })}
      />
    </div>
  );
};

export default DiscoveryFeed;