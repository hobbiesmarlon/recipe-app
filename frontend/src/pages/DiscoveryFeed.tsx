import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';
import { ImageCarousel } from '../components/ui/ImageCarousel';
import { RecipeCard } from '../components/ui/RecipeCard';

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipesData.map((recipe) => (
              <RecipeCard 
                key={recipe.id}
                recipe={recipe}
                isLiked={likedRecipes.has(recipe.id)}
                onToggleLike={toggleLike}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))}
          </div>
        </PageContainer>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default DiscoveryFeed;
