import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SortableList } from '../../components/ui/SortableList';
import { Toast } from '../../components/ui/Toast';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  measurementType: string;
}

interface Option {
  value: string;
  label: string;
}

const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  className?: string;
}> = ({ value, onChange, options, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-full items-center justify-between rounded-lg border-0 bg-stone-200/50 p-4 text-left text-stone-900 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-stone-800/50 dark:text-stone-100 ${className}`}
      >
        <span className={selectedLabel ? "" : "text-stone-500 dark:text-stone-400"}>
          {selectedLabel || placeholder}
        </span>
        <span className="material-symbols-outlined text-stone-500">expand_more</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-stone-800 dark:ring-white/10">
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-700 border-b border-stone-200 dark:border-stone-700 last:border-0 ${
                    option.value === value 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const RecipeIngredients: React.FC = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'All-Purpose Flour', quantity: '250', unit: 'g', measurementType: 'weight' },
    { id: '2', name: 'Large Eggs', quantity: '2', unit: '', measurementType: 'count' },
  ]);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [measurementType, setMeasurementType] = useState('weight');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Please fill in all ingredient fields');

  const handleMeasurementTypeChange = (type: string) => {
    setMeasurementType(type);
    setUnit('');
  };

  const handleAdd = () => {
    const setError = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
    };

    if (!name.trim()) {
        setError('Please enter an ingredient name');
        return;
    }

    if (!quantity.trim()) {
        setError('Please enter a quantity');
        return;
    }

    if (parseFloat(quantity) <= 0) {
        setError('Quantity must be greater than zero');
        return;
    }

    if ((measurementType === 'weight' || measurementType === 'volume') && !unit) {
        setError('Please select a unit');
        return;
    }
    
    const newIngredient: Ingredient = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      quantity,
      unit,
      measurementType
    };

    setIngredients([...ingredients, newIngredient]);
    setName('');
    setQuantity('');
    setUnit('');
    setMeasurementType('weight');
  };

  const handleRemove = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const handleEdit = (id: string) => {
    const ingredientToEdit = ingredients.find(i => i.id === id);
    if (ingredientToEdit) {
      setName(ingredientToEdit.name);
      setQuantity(ingredientToEdit.quantity);
      setMeasurementType(ingredientToEdit.measurementType);
      setUnit(ingredientToEdit.unit);
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  const renderIngredient = (item: Ingredient, index: number, dragHandleProps: any) => (
    <div 
      className="flex items-center justify-between rounded-lg bg-stone-200/50 p-3 dark:bg-stone-800/50 select-none"
    >
      <div className="flex items-center gap-3">
        <div 
          {...dragHandleProps}
          className="text-stone-500 dark:text-stone-400 p-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="material-symbols-outlined">drag_indicator</span>
        </div>
        <p className="font-medium text-stone-800 dark:text-stone-200">
          {item.quantity}{item.unit && <span className="text-xs ml-0.5">{item.unit}</span>} <span className="text-stone-600 dark:text-stone-400 ml-1">{item.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleEdit(item.id); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 hover:bg-stone-300/50 dark:text-stone-400 dark:hover:bg-stone-700/50"
        >
          <span className="material-symbols-outlined text-base">edit</span>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-600 hover:bg-stone-300/50 dark:text-stone-400 dark:hover:bg-stone-700/50"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  );

  const handleNext = () => {
    if (ingredients.length === 0) {
      setToastMessage('Please add at least one ingredient');
      setShowToast(true);
      return;
    }
    navigate('/add-recipe/instructions');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <div className="flex-grow">
        <div className="sticky top-0 md:top-14 z-20 bg-background-light dark:bg-background-dark">
          <header className="flex items-center justify-between bg-background-light px-4 py-3 dark:bg-background-dark pb-1">
            <Link to="/add-recipe/basic" className="flex items-center justify-center text-primary" aria-label="Back">
              <span className="material-symbols-outlined text-3xl">arrow_back</span>
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-background-dark dark:text-background-light">Add Ingredients</h1>
            <div className="w-8"></div>
          </header>
          
          {/* Page Indicators */}
          <div className="flex w-full flex-row items-center justify-center gap-3 pt-0 pb-4" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={5} aria-valuenow={2}>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot progress-dot--active" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
            <div className="h-2 w-2 rounded-full progress-dot" aria-hidden="true"></div>
          </div>
        </div>

        <main className="p-4 mx-auto max-w-2xl lg:max-w-5xl pb-20 lg:pb-6 lg:pt-0">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start lg:min-h-[calc(100vh-300px)]">
            {/* Left Column: Input Form */}
            <div className="space-y-4 lg:sticky lg:top-[192px] lg:z-10 lg:mt-[68px]">
              <div className="space-y-4">
                  <div>
                    <label className="sr-only" htmlFor="ingredient-name">Ingredient name</label>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`h-14 w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400`}
                      id="ingredient-name" 
                      placeholder="Ingredient name" 
                      type="text" 
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="sr-only" htmlFor="quantity">Quantity</label>
                      <input 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={`h-14 w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400`}
                        id="quantity" 
                        placeholder="Quantity" 
                        type="number"
                        min="0"
                        step="any"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="sr-only" htmlFor="unit">Unit</label>
                      {measurementType === 'weight' ? (
                        <CustomSelect 
                          value={unit}
                          onChange={setUnit}
                          placeholder="Select unit"
                          className=""
                          options={[
                            { value: 'g', label: 'grams (g)' },
                            { value: 'kg', label: 'kilograms (kg)' }
                          ]}
                        />
                      ) : measurementType === 'volume' ? (
                        <CustomSelect 
                          value={unit}
                          onChange={setUnit}
                          placeholder="Select unit"
                          className=""
                          options={[
                            { value: 'ml', label: 'millilitres (ml)' },
                            { value: 'L', label: 'litres (L)' }
                          ]}
                        />
                      ) : (
                        <input 
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className={`h-14 w-full rounded-lg border-0 bg-stone-200/50 p-4 text-stone-900 placeholder:text-stone-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-stone-800/50 dark:text-stone-100 dark:placeholder:text-stone-400`}
                          id="unit" 
                          placeholder="e.g. cup, tsp" 
                          type="text" 
                        />
                      )}
                    </div>
                  </div>
                  <fieldset className="rounded-lg bg-stone-200/50 p-1.5 dark:bg-stone-800/50">
                    <legend className="sr-only">Measurement Type</legend>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <input 
                          checked={measurementType === 'weight'}
                          onChange={() => handleMeasurementTypeChange('weight')}
                          className="peer sr-only" 
                          id="weight" 
                          name="measurement-type" 
                          type="radio" 
                          value="weight" 
                        />
                        <label className="flex cursor-pointer items-center justify-center rounded-md py-2 text-sm font-medium text-stone-600 transition-colors peer-checked:bg-primary peer-checked:text-white dark:text-stone-400" htmlFor="weight">Weight</label>
                      </div>
                      <div>
                        <input 
                          checked={measurementType === 'volume'}
                          onChange={() => handleMeasurementTypeChange('volume')}
                          className="peer sr-only" 
                          id="volume" 
                          name="measurement-type" 
                          type="radio" 
                          value="volume" 
                        />
                        <label className="flex cursor-pointer items-center justify-center rounded-md py-2 text-sm font-medium text-stone-600 transition-colors peer-checked:bg-primary peer-checked:text-white dark:text-stone-400" htmlFor="volume">Volume</label>
                      </div>
                      <div>
                        <input 
                          checked={measurementType === 'count'}
                          onChange={() => handleMeasurementTypeChange('count')}
                          className="peer sr-only" 
                          id="count" 
                          name="measurement-type" 
                          type="radio" 
                          value="count" 
                        />
                        <label className="flex cursor-pointer items-center justify-center rounded-md py-2 text-sm font-medium text-stone-600 transition-colors peer-checked:bg-primary peer-checked:text-white dark:text-stone-400" htmlFor="count">Count</label>
                      </div>
                    </div>
                  </fieldset>
                  <button 
                    onClick={handleAdd}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary/20 text-primary transition-colors hover:bg-primary/30 dark:bg-primary/30 dark:hover:bg-primary/40"
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span className="font-bold">Add Ingredient</span>
                  </button>
                </div>
              </div>

            {/* Right Column: Ingredients List */}
            <div className="mt-8 lg:mt-0 relative">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-200 mb-4 lg:sticky lg:top-[124px] lg:z-10 lg:bg-background-light lg:dark:bg-background-dark lg:py-3">
                Ingredients List
              </h2>
              <SortableList 
                items={ingredients}
                onReorder={setIngredients}
                renderItem={renderIngredient}
                keyExtractor={(item) => item.id}
              />
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-background-light dark:bg-background-dark p-4 border-none outline-none lg:static lg:bg-transparent lg:mt-auto lg:pb-10">
        <div className="mx-auto max-w-2xl lg:max-w-5xl">
          <button onClick={handleNext} className="h-12 w-full rounded-full bg-primary text-white font-bold text-base leading-normal flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors outline-none ring-0 focus:ring-0 lg:max-w-xs lg:ml-auto">
            Next Step
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </footer>
      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default RecipeIngredients;
