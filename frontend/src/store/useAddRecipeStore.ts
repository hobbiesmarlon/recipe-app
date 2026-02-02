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

interface AddRecipeState {
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
  categories: string[];

  // Chef's Note
  chefsNote: string;

  // Actions
  setFiles: (files: FileWithId[] | ((prev: FileWithId[]) => FileWithId[])) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrepTime: (time: string) => void;
  setServings: (servings: string) => void;
  setIngredients: (ingredients: Ingredient[] | ((prev: Ingredient[]) => Ingredient[])) => void;
  setInstructions: (instructions: InstructionStep[] | ((prev: InstructionStep[]) => InstructionStep[])) => void;
  setCategories: (categories: string[] | ((prev: string[]) => string[])) => void;
  setChefsNote: (note: string) => void;
  
  // Reset
  reset: () => void;
}

export const useAddRecipeStore = create<AddRecipeState>((set) => ({
  files: [],
  name: '',
  description: '',
  prepTime: '',
  servings: '',
  ingredients: [],
  instructions: [],
  categories: [],
  chefsNote: '',

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
