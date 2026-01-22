import React, { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ImageCarousel } from '../components/ui/ImageCarousel';

const RecipeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

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
    
    if (isLeftSwipe && activeTab === 'ingredients') {
      setActiveTab('instructions');
    }
    if (isRightSwipe && activeTab === 'instructions') {
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
      {/* Hero Image Section */}
      <div className="relative h-72 w-full md:h-96">
        <ImageCarousel images={recipe.images} alt={recipe.title} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
        
        {/* Navigation & Actions */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <Link to="/" className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </Link>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
              </svg>
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="transition-transform active:scale-95"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={isLiked ? 'currentColor' : 'rgba(0,0,0,0.5)'} 
                className={`w-8 h-8 transition-colors ${
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

      <div className="flex-grow -mt-4 rounded-t-3xl bg-background-light dark:bg-background-dark relative z-10 px-4 pt-6">
        <div className="mx-auto max-w-2xl">
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
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors ${
                activeTab === 'ingredients'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors ${
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
            className="animate-fadeIn min-h-[200px]"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {activeTab === 'ingredients' ? (
              <ul className="space-y-3 pb-6">
                {recipe.ingredients.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0"></span>
                    <span className="text-gray-800 dark:text-gray-200">{item}</span>
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
