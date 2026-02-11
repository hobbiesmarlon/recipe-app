import React from 'react';
import { useLocation, Navigate, Outlet, useParams } from 'react-router';
import { useAddRecipeStore } from '../store/useAddRecipeStore';

const AddRecipeGuard: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ recipeId: string }>(); // Check if we have an ID
  const store = useAddRecipeStore();

  const isEditMode = !!params.recipeId;
  const basePath = isEditMode ? `/edit-recipe/${params.recipeId}` : '/add-recipe';

  const isBasicValid = () => {
     const newImageCount = store.files.filter(f => f.file.type.startsWith('image/')).length;
     // For existing media, we trust the type from the store/backend
     const existingImageCount = store.existingMedia.filter(m => m.type === 'image').length;
     
     const totalImages = newImageCount + existingImageCount;

     return (
       !!store.name.trim() &&
       !!store.description.trim() &&
       !!store.prepTime && parseInt(store.prepTime) > 0 &&
       !!store.servings && parseInt(store.servings) > 0 &&
       totalImages > 0
     );
  };

  const isIngredientsValid = () => store.ingredients.length > 0;
  const isInstructionsValid = () => store.instructions.length > 0;

  const path = location.pathname;
  let redirect = null;

  // Check prerequisites for Ingredients
  if (path.includes('/ingredients')) {
      if (!isBasicValid()) {
          redirect = `${basePath}/basic`;
      }
  }
  // Check prerequisites for Instructions
  else if (path.includes('/instructions')) {
      if (!isBasicValid()) {
          redirect = `${basePath}/basic`;
      } else if (!isIngredientsValid()) {
          redirect = `${basePath}/ingredients`;
      }
  }
  // Check prerequisites for Categories
  else if (path.includes('/categories')) {
      if (!isBasicValid()) {
           redirect = `${basePath}/basic`;
      } else if (!isIngredientsValid()) {
           redirect = `${basePath}/ingredients`;
      } else if (!isInstructionsValid()) {
           redirect = `${basePath}/instructions`;
      }
  }
  // Check prerequisites for Chefs Note
  else if (path.includes('/chefs-note')) {
      if (!isBasicValid()) {
           redirect = `${basePath}/basic`;
      } else if (!isIngredientsValid()) {
           redirect = `${basePath}/ingredients`;
      } else if (!isInstructionsValid()) {
           redirect = `${basePath}/instructions`;
      }
      // Categories are optional
  }

  if (redirect) {
      return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};

export default AddRecipeGuard;
