import React from 'react';
import { useNavigate } from 'react-router';
import { useAddRecipeStore } from '../../store/useAddRecipeStore';

interface AddRecipeNavigationProps {
  onNext: () => void;
  backPath?: string;
  nextLabel?: string;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export const AddRecipeNavigation: React.FC<AddRecipeNavigationProps> = ({
  onNext,
  backPath,
  nextLabel = 'Next Step',
  isLastStep = false,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const reset = useAddRecipeStore((state) => state.reset);

  const handleDeleteDraft = () => {
    if (window.confirm("Are you sure you want to delete this draft? All progress will be lost.")) {
      reset();
      navigate('/');
    }
  };

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
            className="text-red-500 font-semibold hover:text-red-700 transition-colors"
            onClick={handleDeleteDraft}
          >
            Delete Draft
          </button>
          
          <button 
            onClick={onNext}
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary text-white px-8 py-2 rounded-xl font-bold hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {nextLabel}
            {!isLoading && (
              <span className="material-symbols-outlined">
                {isLastStep ? 'arrow_forward' : 'arrow_forward'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
