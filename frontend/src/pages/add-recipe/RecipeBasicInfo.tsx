import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toast } from '../../components/ui/Toast';
import { SortableList } from '../../components/ui/SortableList';
import { AddRecipeNavigation } from '../../components/forms/AddRecipeNavigation';
import { useAddRecipeStore } from '../../store/useAddRecipeStore';

const RecipeBasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const { 
    files, setFiles,
    existingMedia, setExistingMedia, markMediaDeleted,
    name, setName,
    description, setDescription,
    prepTime, setPrepTime,
    servings, setServings
  } = useAddRecipeStore();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Please fill in all relevant fields');

  // Combined media state for display
  const [displayMedia, setDisplayMedia] = useState<any[]>([]);

  React.useEffect(() => {
    // Map both lists to a common structure
    const mappedExisting = existingMedia.map(m => ({
        ...m,
        uniqueId: `existing-${m.id}`,
        previewUrl: m.url,
        isExisting: true,
        original: m
    }));
    const mappedFiles = files.map(f => ({
        ...f,
        uniqueId: f.id,
        isExisting: false,
        original: f
    }));
    
    // Merge. If we haven't manually reordered locally, just append.
    // Ideally we respect `display_order` from existingMedia.
    // For now, let's just concatenate or use the order from store if we could track it.
    // Since `files` don't have display_order in store initially, we just append them.
    
    // To avoid "jumping" when store updates (e.g. adding a file), we might want to be careful.
    // But simplistic approach: existing first (sorted by display_order), then files.
    
    const sortedExisting = [...mappedExisting].sort((a, b) => a.display_order - b.display_order);
    setDisplayMedia([...sortedExisting, ...mappedFiles]);
  }, [files, existingMedia]); // This dependency might cause reset of order on every file add... 
  // Actually, `files` and `existingMedia` order in store IS the order.

  const handleNext = () => {
    // Reset toast message
    const setError = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
    };

    if (!name.trim() || !description.trim() || !prepTime || !servings) {
      setError('Please fill in all relevant fields');
      return;
    }

    if (!/^\d+$/.test(prepTime) || parseInt(prepTime) < 1) {
        setError('Prep time must be a whole number greater than 0');
        return;
    }

    if (!/^\d+$/.test(servings) || parseInt(servings) < 1) {
        setError('Servings must be a whole number greater than 0');
        return;
    }

    const imageCount = files.filter(f => f.file.type.startsWith('image/')).length + 
                       existingMedia.filter(m => m.type === 'image').length;

    if (imageCount < 1) {
        setError('Please upload at least one picture');
        return;
    }

    navigate(location.pathname.replace('/basic', '/ingredients'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
          if (file.type.startsWith('image/')) {
              if (!allowedImageTypes.includes(file.type)) {
                  setToastMessage(`Skipped ${file.name}: Only JPG and PNG images are allowed.`);
                  setShowToast(true);
                  continue;
              }
          }
          validFiles.push(file);
      }

      const newFiles = validFiles.map(file => ({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      const currentImages = files.filter(f => f.file.type.startsWith('image/')).length + 
                            existingMedia.filter(m => m.type === 'image').length;
      
      const currentVideos = files.filter(f => f.file.type.startsWith('video/')).length +
                            existingMedia.filter(m => m.type === 'video').length;

      let newImagesCount = 0;
      let newVideosCount = 0;

      for (const { file } of newFiles) {
          if (file.type.startsWith('image/')) newImagesCount++;
          if (file.type.startsWith('video/')) newVideosCount++;
      }

      if (currentVideos + newVideosCount > 1) {
          setToastMessage('Maximum 1 video allowed');
          setShowToast(true);
          return;
      }

      if (currentImages + newImagesCount > 5) {
          setToastMessage('Maximum 5 pictures allowed');
          setShowToast(true);
          return;
      }

      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (uniqueId: string, isExisting: boolean) => {
    if (isExisting) {
        const id = parseInt(uniqueId.replace('existing-', ''));
        markMediaDeleted(id);
    } else {
        setFiles(prev => {
            const index = prev.findIndex(f => f.id === uniqueId);
            if (index !== -1) {
                URL.revokeObjectURL(prev[index].previewUrl);
                return prev.filter((_, i) => i !== index);
            }
            return prev;
        });
    }
  };

  const handleReorder = (newOrder: any[]) => {
      // Update local state immediately for smoothness
      setDisplayMedia(newOrder);

      // Split and update stores with new display_orders
      const newExisting: any[] = [];
      const newFiles: any[] = [];

      newOrder.forEach((item, index) => {
          if (item.isExisting) {
              newExisting.push({ ...item.original, display_order: index, is_primary: index === 0 });
          } else {
              // We don't store display_order on FileWithId, but order in array implies it.
              // However, we need to know the global order later.
              // For now, let's just update the arrays. The merging effect above will resort them...
              // Wait, if we separate them in store, the useEffect above will re-merge them as [Existing, New].
              // This BREAKS the mixed order.
              
              // FIX: The store must support a unified list or we accept that order is reset on refresh/re-mount?
              // No, user wants to reorder.
              
              // Given the complexity, maybe we should just allow reordering existing, AND reordering new, but not mixing?
              // Or, assume existing always come before new?
              
              // If we want mixed order, we need to store `display_order` on `files` too.
              // Let's assume files are added at end.
          }
          newFiles.push(item.original); // This logic is flawed if we mix.
      });
      
      // Let's simplify: existing media always comes first.
      // Reordering is allowed within the list.
      // Actually, SortableList `onReorder` gives us the new array.
      // We can just update our `displayMedia` local state? 
      // But we need to persist it.
      
      // If we want real mixed ordering, we need the store to hold a single list of `MediaItem`.
      // `MediaItem` = `ExistingMedia` | `FileWithId`.
      // This would require a bigger refactor of the store.
      
      // Decision: For this iteration, I will render `existingMedia` and `files` separately or just concatenated.
      // I will disable reordering across the boundary to avoid state sync issues.
      // I will only allow reordering `files` (new ones) amongst themselves, and `existing` amongst themselves.
      // Or just render them in one list but `onReorder` will only update the respective lists order.
      // This effectively un-mixes them if the user tries to mix them.
      
      // Let's implement separate lists for simplicity and robustness.
      // List 1: Existing Media (Sortable)
      // List 2: New Media (Sortable)
  };

  // Simplified Reorder for separate lists
  const handleExistingReorder = (newItems: any[]) => {
      let primaryFound = false;
      const updated = newItems.map((item, idx) => {
          const isPrimary = !primaryFound && item.type === 'image';
          if (isPrimary) primaryFound = true;
          return { ...item, display_order: idx, is_primary: isPrimary };
      });
      setExistingMedia(updated);
  };

  const handleFilesReorder = (newItems: any[]) => {
      setFiles(newItems);
  };
  
  // Actually, let's just show one list and try to handle the split update.
  // If user drags New before Existing, next render will put Existing back first.
  // That's acceptable for a first pass MVP of "Edit".
  
  return (
    <div className="flex min-h-screen lg:h-[calc(100vh-56px)] lg:min-h-0 flex-col bg-background-light dark:bg-background-dark">
      <div className="flex-grow flex flex-col lg:overflow-hidden">
        <div className="sticky top-0 md:top-14 lg:static z-20 bg-background-light dark:bg-background-dark shrink-0">
          <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
            <Link to="/" className="flex items-center justify-center text-primary lg:hidden" aria-label="Close">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
              </svg>
            </Link>
            <div className="hidden lg:block w-8"></div>
            <h1 className="text-lg font-bold text-background-dark dark:text-background-light">
                {existingMedia.length > 0 ? 'Basic Information' : 'Add Basic Information'}
            </h1>
            <div className="w-8"></div>
          </header>
          
          {/* Page Indicators */}
          <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={1}>
            <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          </div>
        </div>

        <main className="p-4 mx-auto max-w-2xl lg:max-w-5xl pb-20 lg:pb-0 lg:pt-0 flex-1 lg:overflow-hidden w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:h-full">
            {/* Left Column: Media */}
            <div className="space-y-4 lg:h-full lg:overflow-y-auto no-scrollbar lg:pr-2 lg:pb-24">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Media</label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center bg-gray-50 dark:bg-gray-800/20">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Add up to 5 pictures and 1 video.</p>
                  </div>
                  <label htmlFor="file-upload" className="mt-2 cursor-pointer rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-primary dark:text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    Upload files
                    <input id="file-upload" type="file" className="sr-only" multiple accept=".jpg,.jpeg,.png,video/*" onChange={handleFileChange} />
                  </label>
                </div>
                
                {/* Existing Media List */}
                {existingMedia.length > 0 && (
                  <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Saved Media</h4>
                      <SortableList
                        items={existingMedia}
                        onReorder={setExistingMedia}
                        keyExtractor={(item) => `existing-${item.id}`}
                        className="grid grid-cols-3 gap-2"
                        renderItem={(item, index, dragHandleProps) => (
                          <div {...dragHandleProps} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-primary/20">
                             {item.type === 'image' ? (
                                <img src={item.url} alt="preview" className="h-full w-full object-cover" />
                             ) : (
                                <video src={item.url} className="h-full w-full object-cover" />
                             )}
                             <button onClick={() => removeFile(`existing-${item.id}`, true)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                        )}
                      />
                  </div>
                )}

                {/* New Files List */}
                {files.length > 0 && (
                  <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">New Uploads</h4>
                      <SortableList
                        items={files}
                        onReorder={setFiles}
                        keyExtractor={(item) => item.id}
                        className="grid grid-cols-3 gap-2"
                        renderItem={(item, index, dragHandleProps) => (
                          <div {...dragHandleProps} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                             {item.file.type.startsWith('image/') ? (
                                <img src={item.previewUrl} alt="preview" className="h-full w-full object-cover" />
                             ) : (
                                <video src={item.previewUrl} className="h-full w-full object-cover" />
                             )}
                             <button onClick={() => removeFile(item.id, false)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                          </div>
                        )}
                      />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6 mt-6 lg:mt-0 lg:h-full lg:overflow-y-auto no-scrollbar lg:pl-2 lg:pb-24">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="recipe-name">Recipe Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400" 
                  id="recipe-name" 
                  placeholder="e.g. Spicy Chicken Curry" 
                  type="text" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="description">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary min-h-[120px] lg:min-h-[200px] resize-none dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400" 
                  id="description" 
                  placeholder="A short and sweet description of your delicious recipe..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="prep-time">Prep Time</label>
                  <div className="flex items-center rounded-lg bg-stone-200/50 dark:bg-stone-800/50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
                    <input 
                      value={prepTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) setPrepTime(val);
                      }}
                      onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                      className="h-14 w-full rounded-l-lg border-0 bg-transparent p-4 text-stone-900 placeholder:text-stone-500 focus:ring-0 dark:text-stone-100" 
                      id="prep-time" 
                      placeholder="30" 
                      type="number" 
                      min="1" 
                      step="1"
                    />
                    <div className="flex h-10 items-center justify-center bg-stone-300/50 dark:bg-stone-700/50 rounded-md m-1.5 px-3">
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400">min</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="servings">Servings</label>
                  <div className="relative rounded-lg bg-stone-200/50 dark:bg-stone-800/50">
                     <input 
                       value={servings}
                       onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d+$/.test(val)) setServings(val);
                       }}
                       onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()}
                       className="h-14 w-full rounded-lg border-0 bg-transparent p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:text-stone-100 dark:placeholder:text-stone-400" 
                       id="servings" 
                       placeholder="e.g. 4" 
                       type="number" 
                       min="1" 
                       step="1"
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none lg:hidden">
        <div className="mx-auto max-w-2xl">
          <button 
            onClick={handleNext}
            className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0"
          >
            Next Step
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </footer>

      <AddRecipeNavigation 
        onNext={handleNext}
        backPath="/"
      />

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default RecipeBasicInfo;