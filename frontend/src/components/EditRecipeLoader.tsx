import React, { useEffect, useState } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router';
import client from '../api/client';
import { useAddRecipeStore } from '../store/useAddRecipeStore';

const EditRecipeLoader: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const setEditMode = useAddRecipeStore(state => state.setEditMode);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
          setError("No recipe ID provided");
          setLoading(false);
          return;
      }

      try {
        const res = await client.get(`/recipes/${recipeId}`);
        const recipe = res.data;
        setEditMode(parseInt(recipeId), recipe);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load recipe", err);
        setError("Failed to load recipe");
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, setEditMode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('/my-recipes')} className="text-primary hover:underline">
          Go back to My Recipes
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default EditRecipeLoader;
