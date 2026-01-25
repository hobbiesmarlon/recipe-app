import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ImageCarousel } from '../components/ui/ImageCarousel';

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const minSwipeDistance = 35;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
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

  // Mock data - in a real app, fetch based on ID
  const recipe = useMemo(() => ({
    id: id,
    title: 'Spicy Thai Basil Chicken',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf'
    ],
    author: 'Isabella',
    time: '45 mins',
    servings: '4',
    ingredients: [
      '1 lb Chicken Breast, minced',
      '2 cups Holy Basil leaves',
      '5 cloves Garlic, minced',
      '5 Thai Chilies, chopped',
      '2 tbsp Oyster Sauce',
      '1 tbsp Soy Sauce',
      '1 tsp Fish Sauce',
      '1 tsp Sugar',
      '1 tbsp Oil'
    ],
    instructions: [
      'Heat oil in a wok or large skillet over high heat.',
      'Add garlic and chilies, stir-fry until fragrant (about 30 seconds).',
      'Add minced chicken and stir-fry until cooked through, breaking it up as you go.',
      'Add oyster sauce, soy sauce, fish sauce, and sugar. Stir to combine.',
      'Add holy basil leaves and toss until wilted. Remove from heat immediately.',
      'Serve hot over steamed jasmine rice, optionally topped with a fried egg.'
    ]
  }), [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe: ${recipe.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Share functionality is not supported on this browser/device.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark pb-safe">
      <div className="mx-auto w-full max-w-2xl">
        {/* Hero Image Section */}
        <div className="relative h-72 w-full md:h-96 md:mt-4 md:rounded-2xl overflow-hidden">
          <ImageCarousel images={recipe.images} alt={recipe.title} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
          
          {/* Navigation & Actions */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <Link to="/" className="text-white hover:text-primary transition-all active:scale-95">
              <span className="material-symbols-rounded text-[28px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">arrow_back</span>
            </Link>
            <div className="flex items-center gap-4">
               <button 
                onClick={handleShare}
                className="text-white hover:text-primary transition-all active:scale-95"
              >
                <span className="material-symbols-rounded text-[28px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">share</span>
              </button>
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="transition-transform active:scale-95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={isLiked ? 'currentColor' : 'none'} 
                  className={`w-7 h-7 transition-colors ${
                    isLiked 
                      ? 'text-primary' 
                      : 'text-white stroke-white'
                  }`}
                  style={{ strokeWidth: isLiked ? 0 : 1.5 }}
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3.25 7.75 3.25c2.105 0 3.875 1.25 4.75 3.22.875-1.97 2.645-3.22 4.75-3.22 3.036 0 5.5 2.072 5.5 5.05 0 3.924-2.438 7.11-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.472 0l-.003-.001z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Title overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-2xl font-bold drop-shadow-md">{recipe.title}</h1>
          </div>
        </div>

        <div className="flex-grow bg-background-light dark:bg-background-dark relative z-10 px-4 pt-6">
          {/* Meta Info Line */}
          <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-1">
               <span>By {recipe.author}</span>
               <span>•</span>
               <span>{recipe.time}</span>
               <span>•</span>
               <span>Serves {recipe.servings}</span>
            </div>
            
            <button 
               onClick={() => setIsSaved(!isSaved)}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isSaved ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
               <span className="material-symbols-outlined text-lg">{isSaved ? 'bookmark_added' : 'bookmark'}</span>
               {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Tabs */}
          <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark flex border-b border-gray-200 dark:border-gray-700 mb-6 pt-2">
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
            onTouchEnd={onTouchEnd}
          >
            {activeTab === 'ingredients' ? (
              <ul className="space-y-3 pb-6">
                {recipe.ingredients.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ol className="space-y-6 pb-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="pt-1">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
