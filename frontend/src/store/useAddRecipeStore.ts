import { create } from 'zustand';

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  measurementType: string;
}

export interface InstructionStep {
  id: string;
  description: string;
}

export interface FileWithId {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ExistingMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
  is_primary: boolean;
  display_order: number;
}

interface AddRecipeState {
  // Edit Mode
  editId: number | null;
  existingMedia: ExistingMedia[];
  deletedMediaIds: number[];

  // Basic Info
  files: FileWithId[];
  name: string;
  description: string;
  prepTime: string;
  servings: string;
  
  // Ingredients
  ingredients: Ingredient[];

  // Instructions
  instructions: InstructionStep[];

  // Categories
  categories: number[];

  // Chef's Note
  chefsNote: string;

  // Actions
  setEditMode: (id: number, recipe: any) => void; // Using any for recipe to avoid circular deps or dup types
  setExistingMedia: (media: ExistingMedia[] | ((prev: ExistingMedia[]) => ExistingMedia[])) => void;
  markMediaDeleted: (id: number) => void;

  setFiles: (files: FileWithId[] | ((prev: FileWithId[]) => FileWithId[])) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrepTime: (time: string) => void;
  setServings: (servings: string) => void;
  setIngredients: (ingredients: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
  setInstructions: (instructions: InstructionStep[] | ((prev: InstructionStep[]) => InstructionStep[])) => void;
  setCategories: (categories: number[] | ((prev: number[]) => number[])) => void;
  setChefsNote: (note: string) => void;
  
  // Reset
  reset: () => void;
}

const CATEGORY_MAP: Record<string, number> = {
  'Breakfast': 1, 'Lunch': 2, 'Dinner': 3, 'Snack': 4, 'Appetizer': 5, 'Dessert': 6, 'Sauce': 7,
  'Baking': 8, 'Frying': 9, 'Grilling': 10, 'Roasting': 11, 'Slow Cook': 12, 'No-Cook': 13,
  'Vegetarian': 14, 'Vegan': 15, 'Gluten-Free': 16, 'Dairy-Free': 17, 'Low-Carb': 18,
  'Sweet': 19, 'Savory': 20, 'Spicy': 21, 'Sour': 22, 'Bitter': 23,
  'Budget Friendly': 24, 'Beginner Friendly': 25, 'Low Effort': 26, '30 Minutes or Less': 27,
  'Cocktail': 28, 'Mocktail': 29, 'Coffee/Tea': 30, 'Juice': 31, 'Milkshake': 32, 'Smoothie': 33,
  'Condiment': 55, 'Salad': 56
};

export const useAddRecipeStore = create<AddRecipeState>((set) => ({
  editId: null,
  existingMedia: [],
  deletedMediaIds: [],
  
  files: [],
  name: '',
  description: '',
  prepTime: '',
  servings: '',
  ingredients: [],
  instructions: [],
  categories: [],
  chefsNote: '',

  setEditMode: (id, recipe) => set({
    editId: id,
    name: recipe.name,
    description: recipe.description || '',
    prepTime: recipe.cook_time_minutes?.toString() || '',
    servings: recipe.servings?.toString() || '',
    chefsNote: recipe.chefs_note || '',
    existingMedia: recipe.media?.map((m: any) => ({
      id: m.id,
      url: m.url,
      type: m.type,
      is_primary: m.is_primary,
      display_order: m.display_order
    })) || [],
    files: [], // Clear new files
    deletedMediaIds: [],
    // Map ingredients
    ingredients: recipe.ingredients?.map((ing: any) => {
        const unit = ing.quantity_text || '';
        const lowerUnit = unit.toLowerCase().trim();
        
        let type = 'count';
        if (['g', 'kg', 'grams', 'kilograms', 'oz', 'lb'].includes(lowerUnit)) {
            type = 'weight';
        } else if (['ml', 'l', 'millilitres', 'litres', 'liter', 'liters'].includes(lowerUnit)) {
            type = 'volume';
        }
        
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: ing.name_text,
            quantity: ing.quantity?.toString() || '',
            unit: unit, 
            measurementType: type
        };
    }) || [],
    // Map instructions
    instructions: recipe.steps?.map((step: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        description: step.instruction
    })) || [],
    // Map categories
    categories: recipe.categories?.map((name: string) => CATEGORY_MAP[name]).filter(Boolean) || []
  }),

  setExistingMedia: (media) => set((state) => ({
    existingMedia: typeof media === 'function' ? media(state.existingMedia) : media
  })),

  markMediaDeleted: (id) => set((state) => ({
    deletedMediaIds: [...state.deletedMediaIds, id],
    existingMedia: state.existingMedia.filter(m => m.id !== id)
  })),

  setFiles: (files) => set((state) => ({ 
    files: typeof files === 'function' ? files(state.files) : files 
  })),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setPrepTime: (prepTime) => set({ prepTime }),
  setServings: (servings) => set({ servings }),
  setIngredients: (ingredients) => set((state) => ({ 
    ingredients: typeof ingredients === 'function' ? ingredients(state.ingredients) : ingredients 
  })),
  setInstructions: (instructions) => set((state) => ({ 
    instructions: typeof instructions === 'function' ? instructions(state.instructions) : instructions 
  })),
  setCategories: (categories) => set((state) => ({
    categories: typeof categories === 'function' ? categories(state.categories) : categories
  })),
  setChefsNote: (chefsNote) => set({ chefsNote }),

  reset: () => set({
    editId: null,
    existingMedia: [],
    deletedMediaIds: [],
    files: [],
    name: '',
    description: '',
    prepTime: '',
    servings: '',
    ingredients: [],
    instructions: [],
    categories: [],
    chefsNote: '',
  }),
}));
