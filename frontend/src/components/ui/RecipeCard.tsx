import React from 'react';
import { ImageCarousel } from './ImageCarousel';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  meta: string;
  image: string;
  images: { url: string; type: 'image' | 'video' }[];
}

interface RecipeCardProps {
  recipe: Recipe;
  isLiked: boolean;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
  onShare: (e: React.MouseEvent, recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  isLiked, 
  onToggleLike, 
  onClick,
  onShare
}) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white dark:bg-surface-dark shadow-sm hover:shadow-md border border-border-light dark:border-border-dark transition-shadow duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-video overflow-hidden">
        <div className="absolute inset-0">
           <ImageCarousel images={recipe.images} alt={recipe.title} />
        </div>
        
        {/* Like Button */}
        <button 
          onClick={(e) => onToggleLike(e, recipe.id)}
          aria-label="Toggle Like"
          className="absolute top-3 right-3 p-1 transition-all active:scale-90 z-10"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isLiked ? 'currentColor' : 'none'} 
            className={`w-7 h-7 transition-colors drop-shadow-md ${
              isLiked 
                ? 'text-primary' 
                : 'text-white'
            }`}
            style={{ strokeWidth: isLiked ? 0 : 2, stroke: isLiked ? 'none' : 'currentColor' }}
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3.25 7.75 3.25c2.105 0 3.875 1.25 4.75 3.22.875-1.97 2.645-3.22 4.75-3.22 3.036 0 5.5 2.072 5.5 5.05 0 3.924-2.438 7.11-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.472 0l-.003-.001z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-base font-bold text-text-light dark:text-text-dark line-clamp-1 mb-1.5">
          {recipe.title}
        </h3>
        
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark line-clamp-2 mb-3">
          {recipe.description}
        </p>
        
        <div className="mt-auto pt-2.5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
             <div className="flex items-center gap-2.5 text-text-muted-light dark:text-text-muted-dark">
                {recipe.meta.split('·').map((part, index) => (
                  <span key={index} className="flex items-center gap-1 text-[10px] font-medium">
                    {index === 0 ? (
                      <span className="material-symbols-rounded text-base">timer</span>
                    ) : (
                      <span className="material-symbols-rounded text-base">group</span>
                    )}
                    {part.trim()}
                  </span>
                ))}
             </div>
             
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 onShare(e, recipe);
               }}
               aria-label="Share Recipe"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/5"
             >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wider">Share</span>
             </button>
        </div>
      </div>
    </div>
  );
};
