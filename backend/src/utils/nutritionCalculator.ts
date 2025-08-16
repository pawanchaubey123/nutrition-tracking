export interface UserMetrics {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  currentBodyFatPercentage: number;
  targetBodyFatPercentage: number;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
}

export class NutritionCalculator {
  private static getActivityMultiplier(activityLevel: string): number {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return multipliers[activityLevel as keyof typeof multipliers] || 1.2;
  }

  static calculateBMR(weight: number, height: number, age: number, gender: string): number {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  static calculateTDEE(bmr: number, activityLevel: string): number {
    return bmr * this.getActivityMultiplier(activityLevel);
  }

  static calculateCalorieTarget(metrics: UserMetrics): number {
    const bmr = this.calculateBMR(metrics.weight, metrics.height, metrics.age, metrics.gender);
    const tdee = this.calculateTDEE(bmr, metrics.activityLevel);
    
    let calorieAdjustment = 0;
    
    if (metrics.goal === 'lose_weight') {
      calorieAdjustment = -500; // 500 calorie deficit for ~1 lb/week weight loss
    } else if (metrics.goal === 'gain_weight') {
      calorieAdjustment = 300; // 300 calorie surplus for lean weight gain
    }
    
    return Math.round(tdee + calorieAdjustment);
  }

  static calculateMacroTargets(metrics: UserMetrics): MacroTargets {
    const calories = this.calculateCalorieTarget(metrics);
    
    // Calculate protein based on body weight: 1.8g × weight
    const protein = Math.round(1.8 * metrics.weight);
    
    // Calculate protein calories
    const proteinCalories = protein * 4;
    
    let fatPercentage = 0.25; // 25% of total calories default
    
    if (metrics.goal === 'lose_weight') {
      fatPercentage = 0.25;
    } else if (metrics.goal === 'gain_weight') {
      fatPercentage = 0.30; // Higher fat for calorie density
    }
    
    const fat = Math.round((calories * fatPercentage) / 9);
    const fatCalories = fat * 9;
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbohydrates = Math.round(carbCalories / 4);
    
    return {
      calories,
      protein,
      carbohydrates: Math.max(0, carbohydrates), // Ensure non-negative
      fat
    };
  }

  static calculateLeanBodyMass(weight: number, bodyFatPercentage: number): number {
    return weight * (1 - bodyFatPercentage / 100);
  }

  static estimateTimeToTarget(
    currentWeight: number,
    currentBodyFat: number,
    targetBodyFat: number,
    goal: string
  ): number {
    const currentLeanMass = this.calculateLeanBodyMass(currentWeight, currentBodyFat);
    const targetWeight = currentLeanMass / (1 - targetBodyFat / 100);
    const weightDifference = Math.abs(targetWeight - currentWeight);
    
    const weeklyWeightLoss = 0.5; // kg per week (safe rate)
    return Math.ceil(weightDifference / weeklyWeightLoss);
  }
}