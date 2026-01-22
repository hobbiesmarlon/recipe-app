import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SortableList } from '../../components/ui/SortableList';
import { Toast } from '../../components/ui/Toast';

interface InstructionStep {
  id: string;
  description: string;
}

const RecipeInstructions: React.FC = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<InstructionStep[]>([
    { id: '1', description: 'Preheat oven to 350°F (175°C).' },
    { id: '2', description: 'In a large bowl, cream together the butter and sugar until smooth.' },
    { id: '3', description: 'Beat in the eggs one at a time, then stir in the vanilla.' }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStepDescription, setNewStepDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleNext = () => {
    if (steps.length === 0) {
      setShowToast(true);
      return;
    }
    navigate('/add-recipe/categories');
  };

  const handleAddStep = () => {
    if (newStepDescription.trim()) {
      if (editingId) {
        setSteps(steps.map(step => 
          step.id === editingId ? { ...step, description: newStepDescription.trim() } : step
        ));
        setEditingId(null);
      } else {
        const newStep: InstructionStep = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          description: newStepDescription.trim()
        };
        setSteps([...steps, newStep]);
      }
      setNewStepDescription('');
      setIsAdding(false);
    }
  };

  const handleEditStep = (step: InstructionStep) => {
    setNewStepDescription(step.description);
    setEditingId(step.id);
    setIsAdding(true);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setNewStepDescription('');
      setIsAdding(false);
    }
  };

  const renderStep = (step: InstructionStep, index: number, dragHandleProps: any) => {
    if (step.id === editingId) {
      return (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 select-none h-[100px]">
          <p className="text-primary font-medium">Step {index + 1}: Editing...</p>
        </div>
      );
    }

    return (
      <div 
        className="flex items-center justify-between rounded-xl bg-white p-5 shadow-lg dark:bg-black/20 select-none"
      >
        <div className="flex items-start gap-3 flex-1">
          <div 
            {...dragHandleProps}
            className="text-background-dark/60 hover:text-primary dark:text-background-light/60 p-1 mt-1 cursor-grab active:cursor-grabbing touch-none"
          >
            <span className="material-symbols-outlined text-3xl">drag_indicator</span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-background-dark dark:text-background-light">Step {index + 1}</p>
            <p className="text-base text-background-dark/80 dark:text-background-light/80 mt-1">{step.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button 
            onClick={(e) => { e.stopPropagation(); handleEditStep(step); }}
            aria-label="edit" 
            className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 hover:text-primary dark:text-background-light/60"
          >
            <span className="material-symbols-outlined text-base">edit</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleRemoveStep(step.id); }}
            aria-label="delete" 
            className="flex h-8 w-8 items-center justify-center rounded-full text-background-dark/60 hover:text-primary dark:text-background-light/60"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
          <Link to="/add-recipe/ingredients" className="flex items-center justify-center text-primary" aria-label="Back">
            <span className="material-symbols-outlined text-3xl"> arrow_back </span>
          </Link>
          <h1 className="text-lg font-bold text-background-dark dark:text-background-light">Add Instructions</h1>
          <div className="w-8"></div>
        </header>
        
        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4 border-b border-primary/10" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={4} aria-valuenow={3}>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-background-light px-4 pt-4 dark:bg-background-dark pb-32">
        <div className="mx-auto max-w-2xl">
          <div className="pb-4">
            <SortableList 
              items={steps}
              onReorder={setSteps}
              renderItem={renderStep}
              keyExtractor={(item) => item.id}
              className="space-y-4"
            />
          </div>

          <div className="mt-4">
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary/20 text-primary transition-colors hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/40" 
                type="button"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="font-bold">Add Step</span>
              </button>
            ) : (
              <div className="mt-3">
                <textarea 
                  value={newStepDescription}
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  className="w-full rounded-md border-gray-300 text-base text-background-dark focus:border-primary focus:ring-primary dark:bg-background-dark dark:text-background-light p-3" 
                  placeholder="Enter step description..." 
                  rows={3}
                  autoFocus
                ></textarea>
                <div className="mt-2 flex justify-end gap-2">
                  <button 
                    onClick={() => { setIsAdding(false); setNewStepDescription(''); setEditingId(null); }}
                    className="rounded-lg px-4 py-2 text-primary hover:bg-primary/10 dark:hover:bg-primary/20" 
                    type="button"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddStep}
                    className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-orange-600 transition-colors" 
                    type="button"
                  >
                    {editingId ? 'Update Step' : 'Add Step'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={handleNext}
            className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0"
          >
            Next Step <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </footer>
      <Toast
        message="Please add at least one step"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default RecipeInstructions;
