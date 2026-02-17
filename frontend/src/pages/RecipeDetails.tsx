import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { Toast } from '../components/ui/Toast';
import client from '../api/client';
import { useAuthStore } from '../store/useAuthStore';

interface RecipeMedia {
  url: string;
  type: 'image' | 'video';
}

interface Ingredient {
  id: number;
  name_text: string;
  quantity?: number;
  quantity_text?: string;
  unit_name?: string;
}

interface Step {
  id: number;
  step_number: number;
  instruction: string;
}

interface FullRecipe {
  id: number;
  name: string;
  description?: string;
  cook_time_minutes?: number;
  servings?: number;
  author_name: string;
  ingredients: Ingredient[];
  steps: Step[];
  media: RecipeMedia[];
  chefs_note?: string;
  is_liked?: boolean;
  is_saved?: boolean;
  likes_count?: number;
}

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [shareToast, setShareToast] = useState({ visible: false, message: '' });
  const { user } = useAuthStore();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const minSwipeDistance = 35;

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      try {
        setLoading(true);
        console.log(`Fetching recipe ${id}...`);
        const response = await client.get(`/recipes/${id}`);
        const data = response.data;
        console.log("Recipe data received:", data);
        setRecipe(data);
        setIsLiked(!!data.is_liked);
        setIsSaved(!!data.is_saved);
        setLikesCount(data.likes_count || 0);
        setError(null);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const toggleLike = async () => {
    if (!recipe) return;
    
    if (!user) {
      setShowAuthToast(true);
      return;
    }

    // Optimistic update
    const previousState = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      if (isLiked) {
        await client.delete(`/recipes/${recipe.id}/like`);
      } else {
        await client.post(`/recipes/${recipe.id}/like`);
      }
    } catch (error) {
      console.error('Failed to toggle like', error);
      // Revert
      setIsLiked(previousState);
      setLikesCount(previousCount);
    }
  };

  const toggleSave = async () => {
    if (!recipe) return;

    if (!user) {
      setShowAuthToast(true);
      return;
    }

    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      if (isSaved) {
        await client.delete(`/recipes/${recipe.id}/save`);
      } else {
        await client.post(`/recipes/${recipe.id}/save`);
      }
    } catch (error) {
      console.error('Failed to toggle save', error);
      setIsSaved(previousState);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Required for some browsers to track movement and prevent vertical scroll during horizontal swipe
    // though touch-pan-y CSS property usually handles this.
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Reset start point
    setTouchStart(null);

    if (isLeftSwipe && activeTab === 'ingredients') {
      setActiveTab('instructions');
    } else if (isRightSwipe && activeTab === 'instructions') {
      setActiveTab('ingredients');
    }
  };

  const handleShare = () => {
    if (recipe) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const shareUrl = `${apiUrl}/share/recipe/${recipe.id}`;

      if (navigator.share) {
        navigator.share({
          title: recipe.name,
          text: `Check out this recipe: ${recipe.name}`,
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
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Oops!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Recipe not found'}</p>
        <Link to="/" className="px-6 py-2 bg-primary text-white rounded-full font-medium">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark pb-safe">
      <div className="mx-auto w-full max-w-2xl md:px-4">
        {/* Hero Image Section */}
        <div className="relative h-80 w-full md:h-[450px] md:mt-4 md:rounded-3xl overflow-hidden group">
          <ImageCarousel 
            images={recipe.media} 
            alt={recipe.name} 
            className="absolute inset-0" 
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
          
          {/* Top Actions Overlay */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white transition-all hover:bg-black/40 active:scale-95"
              aria-label="Back"
            >
              <span className="material-symbols-rounded text-2xl">arrow_back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white transition-all hover:bg-black/40 active:scale-95"
                aria-label="Share"
              >
                <span className="material-symbols-rounded text-xl">share</span>
              </button>
              <button 
                onClick={toggleLike}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white transition-all hover:bg-black/40 active:scale-95"
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={isLiked ? 'currentColor' : 'none'} 
                  className={`w-6 h-6 transition-colors ${isLiked ? 'text-primary' : 'text-white'}`}
                  stroke="currentColor"
                  style={{ strokeWidth: isLiked ? 0 : 2 }}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3.25 7.75 3.25c2.105 0 3.875 1.25 4.75 3.22.875-1.97 2.645-3.22 4.75-3.22 3.036 0 5.5 2.072 5.5 5.05 0 3.924-2.438 7.11-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.472 0l-.003-.001z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Title overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 text-white z-10 flex justify-between items-end">
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-lg leading-tight flex-1">{recipe.name}</h1>
            {likesCount > 0 && (
                <div className="flex items-center gap-1 text-white/90 drop-shadow-md bg-black/30 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                    <span className="material-symbols-rounded text-sm">favorite</span>
                    {likesCount}
                </div>
            )}
          </div>
        </div>

        <div className="flex-grow bg-background-light dark:bg-background-dark relative z-10 px-4 pt-6 -mt-4 rounded-t-3xl md:mt-0 md:rounded-none">
          {/* Meta Info Line */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-1">
               <span>By {recipe.author_name}</span>
               <span>•</span>
               <span>{recipe.cook_time_minutes} mins</span>
               <span>•</span>
               <span>Serves {recipe.servings}</span>
            </div>
            
            <button 
               onClick={toggleSave}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isSaved ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
               <span className="material-symbols-outlined text-lg">{isSaved ? 'bookmark_added' : 'bookmark'}</span>
               {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Tabs */}
          <div className="sticky top-0 md:top-14 z-20 bg-background-light dark:bg-background-dark flex border-b border-gray-200 dark:border-gray-700 mb-6 pt-2">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-all duration-300 ${
                activeTab === 'ingredients'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-all duration-300 ${
                activeTab === 'instructions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Instructions
            </button>
          </div>

          {/* Content */}
          <div 
            key={activeTab}
            className="animate-fadeIn min-h-[200px] touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {activeTab === 'ingredients' ? (
              <ul className="space-y-3 pb-6">
                {recipe.ingredients.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {item.quantity && `${item.quantity} `}
                      {item.quantity_text && `${item.quantity_text} `}
                      {item.unit_name && `${item.unit_name} `}
                      {item.name_text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <ol className="space-y-6 pb-4">
                {[...recipe.steps].sort((a, b) => a.step_number - b.step_number).map((step) => (
                  <li key={step.id} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {step.step_number}
                    </span>
                    <div className="pt-1">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{step.instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {activeTab === 'instructions' && recipe.chefs_note && (
              <div className="mt-2 mb-10 p-4 bg-orange-50 dark:bg-orange-900/10 border-l-4 border-primary rounded-r-xl italic text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold not-italic text-primary mr-1">Chef's Tip:</span>
                {recipe.chefs_note}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast 
        isVisible={showAuthToast}
        message="Sign in to like/save recipes"
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

export default RecipeDetails;