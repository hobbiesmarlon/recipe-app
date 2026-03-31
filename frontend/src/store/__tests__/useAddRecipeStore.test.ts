import { describe, it, expect, beforeEach } from 'vitest';
import { useAddRecipeStore } from '../useAddRecipeStore';

describe('useAddRecipeStore', () => {
  beforeEach(() => {
    useAddRecipeStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useAddRecipeStore.getState();
    expect(state.name).toBe('');
    expect(state.ingredients).toEqual([]);
    expect(state.editId).toBeNull();
  });

  it('should update name', () => {
    useAddRecipeStore.getState().setName('Pasta Carbonara');
    expect(useAddRecipeStore.getState().name).toBe('Pasta Carbonara');
  });

  it('should reset to default values', () => {
    useAddRecipeStore.getState().setName('Temporary Name');
    useAddRecipeStore.getState().reset();
    expect(useAddRecipeStore.getState().name).toBe('');
  });

  it('should correctly map recipe data in setEditMode', () => {
    const mockRecipe = {
      name: 'Old Recipe',
      description: 'Old Desc',
      cook_time_minutes: 20,
      ingredients: [
        { name_text: 'Flour', quantity: 500, quantity_text: 'g' }
      ],
      steps: [
        { instruction: 'Mix everything' }
      ],
      categories: ['Breakfast', 'Vegan']
    };

    useAddRecipeStore.getState().setEditMode(123, mockRecipe);
    
    const state = useAddRecipeStore.getState();
    expect(state.editId).toBe(123);
    expect(state.name).toBe('Old Recipe');
    expect(state.prepTime).toBe('20');
    expect(state.ingredients).toHaveLength(1);
    expect(state.ingredients[0].name).toBe('Flour');
    expect(state.ingredients[0].measurementType).toBe('weight'); // Correctly mapped 'g'
    expect(state.instructions).toHaveLength(1);
    expect(state.categories).toEqual([1, 15]); // Breakfast=1, Vegan=15
  });

  it('should mark media as deleted', () => {
    const initialMedia = [
      { id: 1, url: 'url1', type: 'image', is_primary: true, display_order: 0 },
      { id: 2, url: 'url2', type: 'image', is_primary: false, display_order: 1 }
    ] as any;

    useAddRecipeStore.setState({ existingMedia: initialMedia });
    
    useAddRecipeStore.getState().markMediaDeleted(1);
    
    const state = useAddRecipeStore.getState();
    expect(state.existingMedia).toHaveLength(1);
    expect(state.existingMedia[0].id).toBe(2);
    expect(state.deletedMediaIds).toEqual([1]);
  });
});
