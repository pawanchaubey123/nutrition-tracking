'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Target, TrendingUp, Calendar, LogOut, Trash2 } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  targets: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

interface FoodEntry {
  _id: string;
  foodName: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  meal: string;
  createdAt: string;
}

interface GroupedEntries {
  [meal: string]: FoodEntry[];
}

interface DashboardProps {
  user: User;
  onAddFood: () => void;
  onLogout: () => void;
}

export default function Dashboard({ user, onAddFood, onLogout }: DashboardProps) {
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  });
  const [foodEntries, setFoodEntries] = useState<GroupedEntries>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyEntries();
  }, [selectedDate]);

  const fetchDailyEntries = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/food/entries/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyTotals(response.data.totals);
      setFoodEntries(response.data.entries || {});
    } catch (error) {
      console.error('Error fetching daily entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this food entry?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/food/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the data after deletion
      fetchDailyEntries();
    } catch (error) {
      console.error('Error deleting food entry:', error);
      alert('Failed to delete food entry');
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-gray-300">Track your daily nutrition goals</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onAddFood}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                Add Food
              </button>
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Calendar size={24} className="text-gray-300" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading your daily progress...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Calories</h3>
                  <Target className="text-red-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{dailyTotals.calories.toFixed(2)}</span>
                    <span className="text-gray-300">/ {user.targets.calories}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        getProgressPercentage(dailyTotals.calories, user.targets.calories)
                      )}`}
                      style={{
                        width: `${getProgressPercentage(dailyTotals.calories, user.targets.calories)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {Math.round(getProgressPercentage(dailyTotals.calories, user.targets.calories))}% of goal
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Protein</h3>
                  <TrendingUp className="text-blue-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{dailyTotals.protein.toFixed(2)}g</span>
                    <span className="text-gray-300">/ {user.targets.protein}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        getProgressPercentage(dailyTotals.protein, user.targets.protein)
                      )}`}
                      style={{
                        width: `${getProgressPercentage(dailyTotals.protein, user.targets.protein)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {Math.round(getProgressPercentage(dailyTotals.protein, user.targets.protein))}% of goal
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Carbs</h3>
                  <TrendingUp className="text-green-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{dailyTotals.carbohydrates.toFixed(2)}g</span>
                    <span className="text-gray-300">/ {user.targets.carbohydrates}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        getProgressPercentage(dailyTotals.carbohydrates, user.targets.carbohydrates)
                      )}`}
                      style={{
                        width: `${getProgressPercentage(dailyTotals.carbohydrates, user.targets.carbohydrates)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {Math.round(getProgressPercentage(dailyTotals.carbohydrates, user.targets.carbohydrates))}% of goal
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Fat</h3>
                  <TrendingUp className="text-yellow-500" size={24} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{dailyTotals.fat.toFixed(2)}g</span>
                    <span className="text-gray-300">/ {user.targets.fat}g</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        getProgressPercentage(dailyTotals.fat, user.targets.fat)
                      )}`}
                      style={{
                        width: `${getProgressPercentage(dailyTotals.fat, user.targets.fat)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-300">
                    {Math.round(getProgressPercentage(dailyTotals.fat, user.targets.fat))}% of goal
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Daily Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="font-medium text-white mb-3">Today's Progress</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Calories consumed:</span>
                  <span className="font-semibold text-white">{dailyTotals.calories.toFixed(2)} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining calories:</span>
                  <span className="font-semibold text-white">
                    {Math.max(0, user.targets.calories - dailyTotals.calories).toFixed(2)} kcal
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-white mb-3">Macro Breakdown</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Protein:</span>
                  <span className="font-semibold text-white">{dailyTotals.protein.toFixed(2)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Carbohydrates:</span>
                  <span className="font-semibold text-white">{dailyTotals.carbohydrates.toFixed(2)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Fat:</span>
                  <span className="font-semibold text-white">{dailyTotals.fat.toFixed(2)}g</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Food Entries Section */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Today's Food Entries</h2>
          
          {Object.keys(foodEntries).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No food entries for this date.</p>
              <p className="text-sm mt-2">Click "Add Food" to start tracking your meals!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(foodEntries).map(([meal, entries]) => (
                <div key={meal} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg text-white mb-3 capitalize">
                    {meal} ({entries.length} item{entries.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry._id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-white text-lg">{entry.foodName}</h4>
                              {entry.brand && (
                                <p className="text-sm text-gray-400">{entry.brand}</p>
                              )}
                              <p className="text-sm text-gray-300 mt-1">
                                {entry.quantity} {entry.unit}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="text-red-400 hover:text-red-300 p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-1 sm:gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-gray-400">Calories:</span>
                              <span className="text-white font-medium ml-1">{entry.calories.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Protein:</span>
                              <span className="text-white font-medium ml-1">{entry.protein.toFixed(2)}g</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Carbs:</span>
                              <span className="text-white font-medium ml-1">{entry.carbohydrates.toFixed(2)}g</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Fat:</span>
                              <span className="text-white font-medium ml-1">{entry.fat.toFixed(2)}g</span>
                            </div>
                          </div>
                          
                          {(entry.fiber || entry.sugar || entry.sodium) && (
                            <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-1 sm:gap-4 mt-2 text-sm">
                              {entry.fiber && (
                                <div>
                                  <span className="text-gray-400">Fiber:</span>
                                  <span className="text-white font-medium ml-1">{entry.fiber.toFixed(2)}g</span>
                                </div>
                              )}
                              {entry.sugar && (
                                <div>
                                  <span className="text-gray-400">Sugar:</span>
                                  <span className="text-white font-medium ml-1">{entry.sugar.toFixed(2)}g</span>
                                </div>
                              )}
                              {entry.sodium && (
                                <div>
                                  <span className="text-gray-400">Sodium:</span>
                                  <span className="text-white font-medium ml-1">{entry.sodium.toFixed(2)}mg</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Added: {new Date(entry.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}