'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { X, Save, Sparkles } from 'lucide-react';

const foodEntrySchema = z.object({
  foodName: z.string().optional(),
  foodDescription: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  calories: z.number().min(0, 'Calories must be non-negative'),
  protein: z.number().min(0, 'Protein must be non-negative'),
  carbohydrates: z.number().min(0, 'Carbohydrates must be non-negative'),
  fat: z.number().min(0, 'Fat must be non-negative'),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
  meal: z.enum(['breakfast', 'lunch', 'dinner', 'snack'])
});

type FoodEntryData = z.infer<typeof foodEntrySchema>;

interface FoodLoggerProps {
  onClose: () => void;
  onFoodAdded: () => void;
}

export default function FoodLogger({ onClose, onFoodAdded }: FoodLoggerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FoodEntryData>({
    resolver: zodResolver(foodEntrySchema),
    defaultValues: {
      meal: 'breakfast'
    }
  });

  const watchedValues = watch(['foodName', 'quantity', 'unit']);

  const handleNutritionLookup = async () => {
    setIsLookingUp(true);
    try {
      const token = localStorage.getItem('token');
      let requestData;

      if (useSimpleMode) {
        const [foodName, quantity, unit] = watchedValues;
        
        if (!foodName || !quantity || !unit) {
          alert('Please enter food name, quantity, and unit first');
          return;
        }

        requestData = { foodName, quantity, unit };
      } else {
        const foodDescription = watch('foodDescription');
        
        if (!foodDescription || foodDescription.trim().length === 0) {
          alert('Please enter a food description first');
          return;
        }

        requestData = { foodDescription };
      }

      const response = await axios.post('http://localhost:8000/api/food/nutrition-lookup', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const nutrition = response.data.nutrition;
      
      // Auto-fill the nutrition fields
      setValue('calories', nutrition.calories);
      setValue('protein', nutrition.protein);
      setValue('carbohydrates', nutrition.carbohydrates);
      setValue('fat', nutrition.fat);
      if (nutrition.fiber) setValue('fiber', nutrition.fiber);
      if (nutrition.sugar) setValue('sugar', nutrition.sugar);
      if (nutrition.sodium) setValue('sodium', nutrition.sodium);

      alert('Nutrition data loaded successfully!');
    } catch (error: any) {
      console.error('Nutrition lookup error:', error);
      alert(error.response?.data?.message || 'Failed to lookup nutrition data');
    } finally {
      setIsLookingUp(false);
    }
  };

  const onSubmit = async (data: FoodEntryData) => {
    console.log('Submit mode:', useSimpleMode ? 'Simple' : 'Complex');
    console.log('Form data:', data);
    
    // Validate based on current mode
    if (!useSimpleMode) {
      // Complex mode - only validate description
      if (!data.foodDescription || data.foodDescription.trim() === '') {
        alert('Please enter a food description');
        return;
      }
      console.log('Complex mode validation passed');
    } else {
      // Simple mode - validate traditional fields
      if (!data.foodName || !data.quantity || !data.unit) {
        alert('Please enter food name, quantity, and unit');
        return;
      }
      console.log('Simple mode validation passed');
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data based on mode
      let logData;
      
      if (!useSimpleMode) {
        // Complex mode - use description as food name
        logData = {
          ...data,
          date: new Date().toISOString().split('T')[0],
          foodName: data.foodDescription,
          quantity: 1, // Default for complex descriptions
          unit: 'serving', // Default for complex descriptions
          brand: '', // Clear brand for complex descriptions
        };
      } else {
        // Simple mode - use all provided data
        logData = {
          ...data,
          date: new Date().toISOString().split('T')[0],
        };
      }

      await axios.post('http://localhost:8000/api/food/log', logData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      reset();
      onFoodAdded();
      onClose();
    } catch (error: any) {
      console.error('Error logging food:', error);
      alert(error.response?.data?.message || 'Failed to log food');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Log Food Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setUseSimpleMode(true);
                  // Clear form when switching modes
                  reset();
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  useSimpleMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Simple Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseSimpleMode(false);
                  // Clear form when switching modes  
                  reset();
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !useSimpleMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Complex Description
              </button>
            </div>
            <p className="text-sm text-gray-400">
              {useSimpleMode 
                ? 'Use for single foods with specific quantities (e.g., "100g chicken")' 
                : 'Use for complex meals (e.g., "1 plate kadhi chawal with 1/2 cup chana")'
              }
            </p>
          </div>

          {!useSimpleMode ? (
            /* Complex Food Description Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Describe Your Meal *
                </label>
                <textarea
                  {...register('foodDescription')}
                  rows={3}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1 plate kadhi chawal with 1/2 cup chana, 2 roti with dal and sabzi, chicken biryani with raita"
                />
                {errors.foodDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodDescription.message}</p>
                )}
              </div>
            </div>
          ) : (
            /* Simple Mode - Original Fields */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-1">
                  Food Name *
                </label>
                <input
                  {...register('foodName')}
                  type="text"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chicken Breast"
                />
                {errors.foodName && (
                  <p className="text-red-500 text-sm mt-1">{errors.foodName.message}</p>
                )}
              </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Brand (optional)
              </label>
              <input
                {...register('brand')}
                type="text"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tyson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Meal *
              </label>
              <select
                {...register('meal')}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              {errors.meal && (
                <p className="text-red-500 text-sm mt-1">{errors.meal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Quantity *
              </label>
              <input
                {...register('quantity', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? undefined : Number(value)
                })}
                type="number"
                step="0.1"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Unit *
              </label>
              <select
                {...register('unit')}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select unit</option>
                <option value="grams">Grams</option>
                <option value="ounces">Ounces</option>
                <option value="cups">Cups</option>
                <option value="pieces">Pieces</option>
                <option value="slices">Slices</option>
                <option value="scoop">Scoop (30g)</option>
                <option value="tbsp">Tablespoons</option>
                <option value="tsp">Teaspoons</option>
              </select>
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
              )}
            </div>
          </div>
          )}

          <div className="mt-4">
            <button
              type="button"
              onClick={handleNutritionLookup}
              disabled={isLookingUp}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <Sparkles size={20} />
{isLookingUp ? 'Getting nutrition data...' : 'Get Nutrition Data with Gemini AI'}
            </button>
            <p className="text-sm text-gray-400 mt-1">
              {useSimpleMode 
                ? 'Gemini AI will automatically fill nutrition information for single foods' 
                : 'Gemini AI will analyze your entire meal description and provide total nutrition'
              }
            </p>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Nutrition Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Calories *
                </label>
                <input
                  {...register('calories', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="200"
                />
                {errors.calories && (
                  <p className="text-red-500 text-sm mt-1">{errors.calories.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Protein (g) *
                </label>
                <input
                  {...register('protein', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
                {errors.protein && (
                  <p className="text-red-500 text-sm mt-1">{errors.protein.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Carbohydrates (g) *
                </label>
                <input
                  {...register('carbohydrates', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
                {errors.carbohydrates && (
                  <p className="text-red-500 text-sm mt-1">{errors.carbohydrates.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Fat (g) *
                </label>
                <input
                  {...register('fat', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? 0 : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8"
                />
                {errors.fat && (
                  <p className="text-red-500 text-sm mt-1">{errors.fat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Fiber (g)
                </label>
                <input
                  {...register('fiber', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Sugar (g)
                </label>
                <input
                  {...register('sugar', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-1">
                  Sodium (mg)
                </label>
                <input
                  {...register('sodium', { 
                    valueAsNumber: true,
                    setValueAs: (value) => value === '' ? undefined : Number(value)
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Save size={20} />
              {isLoading ? 'Saving...' : 'Save Food Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}