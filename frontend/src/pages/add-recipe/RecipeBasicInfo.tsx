import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toast } from '../../components/ui/Toast';
import { SortableList } from '../../components/ui/SortableList';
import { AddRecipeNavigation } from '../../components/forms/AddRecipeNavigation';

type FileWithId = {
  id: string;
  file: File;
  previewUrl: string;
};

const RecipeBasicInfo: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileWithId[]>([]);
  
  // Keep track of URLs to cleanup on unmount
  const fileUrlsRef = useRef<string[]>([]);

  // Update ref whenever files change so we have the latest list for unmount cleanup
  useEffect(() => {
    fileUrlsRef.current = files.map(f => f.previewUrl);
  }, [files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fileUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Please fill in all relevant fields');

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

    const imageCount = files.filter(f => f.file.type.startsWith('image/')).length;
    if (imageCount < 1) {
        setError('Please upload at least one picture');
        return;
    }

    navigate('/add-recipe/ingredients');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        file,
        previewUrl: URL.createObjectURL(file)
      }));
      
      const currentImages = files.filter(f => f.file.type.startsWith('image/')).length;
      const currentVideos = files.filter(f => f.file.type.startsWith('video/')).length;

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

  const removeFile = (index: number) => {
    setFiles(prev => {
        const fileToRemove = prev[index];
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="flex-grow">
        <div className="sticky top-0 md:top-14 z-20 bg-background-light dark:bg-background-dark">
          <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
            <Link to="/" className="flex items-center justify-center text-primary lg:hidden" aria-label="Close">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
              </svg>
            </Link>
            <div className="hidden lg:block w-8"></div>
            <h1 className="text-lg font-bold text-background-dark dark:text-background-light">Add Basic Information</h1>
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

        <main className="p-4 space-y-6 mx-auto max-w-2xl lg:max-w-5xl pb-20 lg:pb-6 lg:pt-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            {/* Left Column: Media */}
            <div className="space-y-4 lg:sticky lg:top-[124px]">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Media</label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center bg-gray-50 dark:bg-gray-800/20">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Add up to 5 pictures and 1 video. Drag to reorder, the first one will be the cover.</p>
                  </div>
                  <label htmlFor="file-upload" className="mt-2 cursor-pointer rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-primary dark:text-primary shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                    Upload files
                    <input id="file-upload" type="file" className="sr-only" multiple accept="image/*,video/*" onChange={handleFileChange} />
                  </label>
                </div>
                {files.length > 0 && (
                  <SortableList
                    items={files}
                    onReorder={setFiles}
                    keyExtractor={(item) => item.id}
                    className="grid grid-cols-3 gap-2 mt-2"
                    renderItem={(item, index, dragHandleProps) => (
                      <div {...dragHandleProps} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                         {item.file.type.startsWith('image/') ? (
                            <img src={item.previewUrl} alt="preview" className="h-full w-full object-cover" />
                         ) : (
                            <video src={item.previewUrl} className="h-full w-full object-cover" />
                         )}
                         <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6 mt-6 lg:mt-0">
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
