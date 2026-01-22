import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import { ImageCarousel } from '../components/ui/ImageCarousel';

interface Recipe {
  id: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  images: string[];
}

const recipesData: Recipe[] = [
  {
    id: '1',
    title: 'Spicy Thai Basil Chicken',
    description: 'A flavorful dish with a kick, perfect for a quick weeknight dinner.',
    meta: '30 min · 4 servings',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtzKBDMQCKlDlTf5ZpsPzqM8KSuFBFHjh-TeYIALeQHWDN4csF3ehPAOCR-1BN4dQcLUFUauEvXx8lmJxtuO87V9mLKJbP6nU6lrlgjBO9Z-dZWtVa_Cz579T5oa82WgPJ2acNYoA8p774IveZPU8ddnSnDgcFYZRQ-s3vN1KlywzW4LnsEbqx0AQlLEPu6XDFHHSWa40ismz5amv9GEStGD7ZLuSUogqYuKy7tMQHfiLvct58drCg7ZFBMEfVitWXdp3OOo3453NE'
    ]
  },
  {
    id: '2',
    title: 'Creamy Tomato Pasta',
    description: 'A comforting and rich pasta dish with a hint of sweetness.',
    meta: '45 min · 6 servings',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH'
    ]
  },
  {
    id: '3',
    title: 'Avocado Toast with Poached Egg',
    description: 'A simple yet elegant breakfast or brunch option.',
    meta: '20 min · 2 servings',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtzKBDMQCKlDlTf5ZpsPzqM8KSuFBFHjh-TeYIALeQHWDN4csF3ehPAOCR-1BN4dQcLUFUauEvXx8lmJxtuO87V9mLKJbP6nU6lrlgjBO9Z-dZWtVa_Cz579T5oa82WgPJ2acNYoA8p774IveZPU8ddnSnDgcFYZRQ-s3vN1KlywzW4LnsEbqx0AQlLEPu6XDFHHSWa40ismz5amv9GEStGD7ZLuSUogqYuKy7tMQHfiLvct58drCg7ZFBMEfVitWXdp3OOo3453NE',
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtzKBDMQCKlDlTf5ZpsPzqM8KSuFBFHjh-TeYIALeQHWDN4csF3ehPAOCR-1BN4dQcLUFUauEvXx8lmJxtuO87V9mLKJbP6nU6lrlgjBO9Z-dZWtVa_Cz579T5oa82WgPJ2acNYoA8p774IveZPU8ddnSnDgcFYZRQ-s3vN1KlywzW4LnsEbqx0AQlLEPu6XDFHHSWa40ismz5amv9GEStGD7ZLuSUogqYuKy7tMQHfiLvct58drCg7ZFBMEfVitWXdp3OOo3453NE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf'
    ]
  }
];

const DiscoveryFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Latest');
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
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

  const tabs = ['Latest', 'Most Viewed', 'Most Liked'];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 sticky top-0 z-10 bg-background-light dark:bg-background-dark">
        <PageContainer>
          <div className="flex items-center justify-between">
            <div className="w-6"></div>
            <h2 className="text-lg font-bold">Recipes</h2>
            <div className="w-10"></div>
          </div>

          <div className="mt-4 flex gap-2 px-0 pb-3 overflow-x-auto whitespace-nowrap no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors flex-shrink-0 ${
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

      <main className="pb-24">
        <PageContainer className="space-y-6">
          {recipesData.map((recipe) => (
            <div 
              key={recipe.id} 
              onClick={() => navigate(`/recipe/${recipe.id}`)}
              className="cursor-pointer overflow-hidden rounded-xl bg-white dark:bg-background-dark/50 shadow-sm border border-border-light dark:border-border-dark transition-transform active:scale-[0.99]"
            >
              <div className="relative w-full aspect-video">
                <ImageCarousel images={recipe.images} alt={recipe.title} className="absolute inset-0" />
                <button 
                  onClick={(e) => toggleLike(e, recipe.id)}
                  className="absolute top-3 right-3 transition-transform active:scale-95"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={likedRecipes.has(recipe.id) ? 'currentColor' : 'rgba(0,0,0,0.5)'} 
                    className={`w-7 h-7 transition-colors ${
                      likedRecipes.has(recipe.id) 
                        ? 'text-primary' 
                        : 'text-white stroke-white'
                    }`}
                    style={{ strokeWidth: likedRecipes.has(recipe.id) ? 0 : 1.5 }}
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3.25 7.75 3.25c2.105 0 3.875 1.25 4.75 3.22.875-1.97 2.645-3.22 4.75-3.22 3.036 0 5.5 2.072 5.5 5.05 0 3.924-2.438 7.11-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.472 0l-.003-.001z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold text-text-light dark:text-text-dark">{recipe.title}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-2 -mt-1 rounded-full bg-gray-100 dark:bg-white/10 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-text-muted-light dark:text-text-muted-dark">{recipe.description}</p>
                <p className="mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">{recipe.meta}</p>
              </div>
            </div>
          ))}
        </PageContainer>
      </main>

      <BottomNav />
    </div>
  );
};

export default DiscoveryFeed;
