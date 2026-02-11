import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AddRecipeNavigation } from '../../components/forms/AddRecipeNavigation';
import { useAddRecipeStore } from '../../store/useAddRecipeStore';
import client from '../../api/client';
import { Toast } from '../../components/ui/Toast';

const RecipeChefsNote: React.FC = () => {
  const navigate = useNavigate();
  const store = useAddRecipeStore();
  const { chefsNote: note, setChefsNote: setNote, editId, existingMedia } = store;
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{message: string, isVisible: boolean} | null>(null);

  const showFeedback = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const handlePublish = async () => {
    if (!store.name) {
        showFeedback("Recipe name is required.");
        return;
    }

    const newMediaFiles = store.files.filter(f => f.file);
    const totalMedia = newMediaFiles.length + existingMedia.length;

    if (totalMedia === 0) {
        showFeedback("Please upload at least one image.");
        return;
    }

    if (store.ingredients.length === 0) {
        showFeedback("Please add at least one ingredient.");
        return;
    }

    if (store.instructions.length === 0) {
        showFeedback("Please add at least one instruction step.");
        return;
    }

    setIsPublishing(true);
    showFeedback(editId ? "Updating recipe..." : "Preparing to publish...");

    try {
        let uploadedMedia: any[] = [];

        if (newMediaFiles.length > 0) {
            showFeedback("Uploading new media...");

            // Get presigned URLs
            const presignedRes = await client.post('/media/presigned-posts', 
                newMediaFiles.map(f => ({
                    filename: f.file.name,
                    type: f.file.type.startsWith('video') ? 'video' : 'image',
                    content_type: f.file.type
                }))
            );

            // Upload files
            uploadedMedia = await Promise.all(presignedRes.data.map(async (presigned: any, index: number) => {
                const file = newMediaFiles[index].file;
                const formData = new FormData();
                
                // Fields must be added before the file
                Object.keys(presigned.fields).forEach(key => {
                    formData.append(key, presigned.fields[key]);
                });
                formData.append('file', file);

                const uploadResp = await fetch(presigned.url, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResp.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }
                
                return {
                    key: presigned.key,
                    type: file.type.startsWith('video') ? 'video' : 'image',
                    content_type: file.type,
                    // is_primary and display_order calculated below
                };
            }));
        }

        showFeedback("Finalizing recipe...");
        
        // Construct Media Payload
        // We append new media after existing media
        // (Since we didn't implement full mixed reordering in UI yet)
        const finalMediaPayload = [];
        let currentIndex = 0;
        let primaryImageFound = false;

        // 1. Existing Media
        for (const m of existingMedia) {
            const isPrimary = !primaryImageFound && m.type === 'image';
            if (isPrimary) primaryImageFound = true;

            finalMediaPayload.push({
                id: m.id,
                type: m.type,
                is_primary: isPrimary,
                display_order: currentIndex
            });
            currentIndex++;
        }

        // 2. New Media
        for (const m of uploadedMedia) {
            const isPrimary = !primaryImageFound && m.type === 'image';
            if (isPrimary) primaryImageFound = true;

            finalMediaPayload.push({
                ...m,
                is_primary: isPrimary,
                display_order: currentIndex
            });
            currentIndex++;
        }

        // Construct Payload
        const payload = {
            name: store.name,
            description: store.description,
            chefs_note: note,
            cook_time_minutes: parseInt(store.prepTime) || 0,
            servings: parseInt(store.servings) || 1,
            is_public: true,
            categories: store.categories, 
            ingredients: store.ingredients.map((ing, index) => ({
                name_text: ing.name,
                quantity: parseFloat(ing.quantity) || 0,
                quantity_text: ing.unit, // Assuming unit maps to quantity_text for now
                display_order: index
            })),
            steps: store.instructions.map((step, index) => ({
                step_number: index + 1,
                instruction: step.description
            })),
            media: finalMediaPayload
        };
        
        let response;
        if (editId) {
             response = await client.patch(`/recipes/${editId}`, payload);
             showFeedback("Recipe updated successfully!");
        } else {
             response = await client.post('/recipes/with-media', payload);
             showFeedback("Success! Your recipe is live.");
        }
        
        // Wait a bit so user can see success message
        setTimeout(() => {
            navigate(`/recipe/${response.data.id}`);
            // Reset store after a short delay to ensure navigation occurs first
            // and we leave the guarded route before the store is cleared.
            setTimeout(() => {
                store.reset();
            }, 100);
        }, 1500);

    } catch (error: any) {
        console.error("Publishing failed:", error);
        const errorMessage = error.response?.data?.detail || error.message || "Failed to publish recipe.";
        showFeedback(`Error: ${errorMessage}`);
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="sticky top-0 md:top-14 z-20 bg-background-light dark:bg-background-dark">
        <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
          <Link to="/add-recipe/categories" className="flex items-center justify-center text-primary lg:hidden" aria-label="Back">
            <span className="material-symbols-outlined text-3xl">arrow_back</span>
          </Link>
          <div className="hidden lg:block w-8"></div>
          <h2 className="text-lg font-bold text-background-dark dark:text-background-light flex-1 text-center">
              {editId ? 'Chef\'s Note' : 'Add Chef\'s Note'}
          </h2>
          <div className="w-8"></div>
        </header>

        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={5}>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
        </div>
      </div>

      <main className="flex-grow p-4 pb-28 sm:p-6 sm:pb-32">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="chefs-note">
              Share a few extra notes about your recipe
            </label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary min-h-[200px] resize-none dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400" 
              id="chefs-note" 
              placeholder="Tips, tricks, or a personal story about this dish"
            ></textarea>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none lg:hidden">
        <div className="mx-auto max-w-2xl">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0 disabled:opacity-70"
          >
            {isPublishing ? (editId ? 'Updating...' : 'Publishing...') : (editId ? 'Update Recipe' : 'Publish Recipe')} 
            {!isPublishing && <span className="material-symbols-outlined">check</span>}
          </button>
        </div>
      </footer>

      <AddRecipeNavigation 
        onNext={handlePublish}
        backPath="/add-recipe/categories"
        nextLabel={isPublishing ? (editId ? "Updating..." : "Publishing...") : (editId ? "Update Recipe" : "Publish Recipe")}
        isLastStep={true}
        isLoading={isPublishing}
      />
      
      {toast && (
        <Toast 
          message={toast.message} 
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => prev ? { ...prev, isVisible: false } : null)} 
        />
      )}
    </div>
  );
};

export default RecipeChefsNote;
