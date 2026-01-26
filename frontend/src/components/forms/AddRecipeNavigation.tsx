import React from 'react';
import { useNavigate } from 'react-router';

interface AddRecipeNavigationProps {
  onNext: () => void;
  backPath?: string;
  nextLabel?: string;
  isLastStep?: boolean;
}

export const AddRecipeNavigation: React.FC<AddRecipeNavigationProps> = ({
  onNext,
  backPath,
  nextLabel = 'Next Step',
  isLastStep = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-30 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark py-3">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        {backPath ? (
          <button 
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-text-light dark:text-text-dark font-semibold hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        ) : (
          <div className="w-20" /> 
        )}

        <div className="flex items-center gap-8">
          <button 
            className="text-text-muted-light dark:text-text-muted-dark font-semibold hover:text-primary transition-colors"
            onClick={() => alert('Draft saved (mock)')}
          >
            Save Draft
          </button>
          
          <button 
            onClick={onNext}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            {nextLabel}
            <span className="material-symbols-outlined">
              {isLastStep ? 'arrow_forward' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
