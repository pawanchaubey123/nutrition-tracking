import { GoogleGenAI } from '@google/genai';

interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export class NutritionService {
  // Method for free-text food descriptions
  static async getNutritionDataFromDescription(foodDescription: string): Promise<NutritionData> {
    try {
      // Check if API key is available
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('API Key available:', apiKey ? 'Yes' : 'No');
      console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured');
      }

      // Initialize Gemini with new API
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Please analyze this food description and provide total nutritional information: "${foodDescription}"

This can be complex combinations like:
- "1 plate kadhi chawal with 1/2 cup chana"
- "2 roti with dal and sabzi"
- "1 bowl rajma rice with salad"
- "chicken biryani with raita and pickle"

Analyze ALL components mentioned and provide the TOTAL nutrition for the entire meal described.

Return ONLY a valid JSON object with this exact structure (no additional text, no markdown, no explanation):
{
  "calories": number,
  "protein": number,
  "carbohydrates": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number
}

Units:
- calories: kcal
- protein, carbohydrates, fat, fiber, sugar: grams
- sodium: milligrams

Be as accurate as possible. Consider typical serving sizes for Indian meals and regional cuisines. If unsure about portions, use standard serving sizes.

Examples:
- "1 plate kadhi chawal" might be: {"calories": 450, "protein": 12, "carbohydrates": 75, "fat": 8, "fiber": 4, "sugar": 6, "sodium": 800}
- "2 roti with dal" might be: {"calories": 380, "protein": 16, "carbohydrates": 65, "fat": 6, "fiber": 8, "sugar": 3, "sodium": 600}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const content = response.text;

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Clean the response to extract just the JSON
      let jsonString = content.trim();
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove any extra text before/after JSON
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      // Parse the JSON response
      const nutritionData = JSON.parse(jsonString);
      
      // Validate the response structure
      const requiredFields = ['calories', 'protein', 'carbohydrates', 'fat'];
      for (const field of requiredFields) {
        if (typeof nutritionData[field] !== 'number') {
          throw new Error(`Invalid nutrition data: missing or invalid ${field}`);
        }
      }

      return {
        calories: Math.round(nutritionData.calories * 100) / 100,
        protein: Math.round(nutritionData.protein * 100) / 100,
        carbohydrates: Math.round(nutritionData.carbohydrates * 100) / 100,
        fat: Math.round(nutritionData.fat * 100) / 100,
        fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * 100) / 100 : undefined,
        sugar: nutritionData.sugar ? Math.round(nutritionData.sugar * 100) / 100 : undefined,
        sodium: nutritionData.sodium ? Math.round(nutritionData.sodium * 100) / 100 : undefined,
      };
    } catch (error: any) {
      console.error('Error getting Gemini nutrition data from description:', {
        message: error.message,
        status: error.status,
        details: error.details,
        fullError: error
      });
      
      // Fall back to basic estimate for complex meals
      return {
        calories: 400,
        protein: 15,
        carbohydrates: 60,
        fat: 10,
        fiber: 8,
        sugar: 5,
        sodium: 800,
      };
    }
  }

  static async getNutritionData(foodName: string, quantity: number, unit: string): Promise<NutritionData> {
    try {
      // Check if API key is available
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('API Key available:', apiKey ? 'Yes' : 'No');
      console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
      
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured');
      }

      // Initialize Gemini with new API
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Please provide the nutritional information for ${quantity} ${unit} of ${foodName}.

This can include complex foods like "1 cup cooked chana" or "2 pieces samosa" - analyze them accurately.

Return ONLY a valid JSON object with this exact structure (no additional text, no markdown, no explanation):
{
  "calories": number,
  "protein": number,
  "carbohydrates": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number
}

Units:
- calories: kcal
- protein, carbohydrates, fat, fiber, sugar: grams
- sodium: milligrams

Be as accurate as possible using standard nutritional databases. If the food is not recognized, provide reasonable estimates based on similar foods.

Examples:
- "100 grams chicken breast" should return approximately: {"calories": 165, "protein": 31, "carbohydrates": 0, "fat": 3.6, "fiber": 0, "sugar": 0, "sodium": 74}
- "1 cup cooked rice" should return approximately: {"calories": 205, "protein": 4.3, "carbohydrates": 42, "fat": 0.6, "fiber": 0.6, "sugar": 0.2, "sodium": 2}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const content = response.text;

      if (!content) {
        throw new Error('No response from Gemini');
      }

      // Clean the response to extract just the JSON
      let jsonString = content.trim();
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove any extra text before/after JSON
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      // Parse the JSON response
      const nutritionData = JSON.parse(jsonString);
      
      // Validate the response structure
      const requiredFields = ['calories', 'protein', 'carbohydrates', 'fat'];
      for (const field of requiredFields) {
        if (typeof nutritionData[field] !== 'number') {
          throw new Error(`Invalid nutrition data: missing or invalid ${field}`);
        }
      }

      return {
        calories: Math.round(nutritionData.calories * 100) / 100,
        protein: Math.round(nutritionData.protein * 100) / 100,
        carbohydrates: Math.round(nutritionData.carbohydrates * 100) / 100,
        fat: Math.round(nutritionData.fat * 100) / 100,
        fiber: nutritionData.fiber ? Math.round(nutritionData.fiber * 100) / 100 : undefined,
        sugar: nutritionData.sugar ? Math.round(nutritionData.sugar * 100) / 100 : undefined,
        sodium: nutritionData.sodium ? Math.round(nutritionData.sodium * 100) / 100 : undefined,
      };
    } catch (error: any) {
      console.error('Error getting Gemini nutrition data:', {
        message: error.message,
        status: error.status,
        details: error.details,
        fullError: error
      });
      
      // Fall back to local database
      return this.getNutritionDataFallback(foodName, quantity, unit);
    }
  }

  private static convertToGrams(quantity: number, unit: string): number {
    const conversionRates: { [key: string]: number } = {
      'grams': 1,
      'ounces': 28.35,
      'cups': 240,      // Approximate for liquids
      'pieces': 100,    // Assume average piece is 100g
      'slices': 30,     // Assume average slice is 30g
      'tbsp': 15,       // Tablespoon
      'tsp': 5,         // Teaspoon
      'scoop': 30       // Standard protein scoop (30g)
    };

    return quantity * (conversionRates[unit.toLowerCase()] || 100);
  }

  // Fallback method using local nutrition database
  static async getNutritionDataFallback(foodName: string, quantity: number, unit: string): Promise<NutritionData> {
    // Comprehensive nutrition database (per 100g)
    const nutritionDatabase: { [key: string]: NutritionData } = {
      // Proteins
      'chicken breast': { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      'chicken': { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
      'salmon': { calories: 208, protein: 22, carbohydrates: 0, fat: 12, fiber: 0, sugar: 0, sodium: 93 },
      'tuna': { calories: 132, protein: 28, carbohydrates: 0, fat: 1, fiber: 0, sugar: 0, sodium: 47 },
      'egg': { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 124 },
      'beef': { calories: 250, protein: 26, carbohydrates: 0, fat: 15, fiber: 0, sugar: 0, sodium: 72 },
      'pork': { calories: 242, protein: 27, carbohydrates: 0, fat: 14, fiber: 0, sugar: 0, sodium: 62 },
      'tofu': { calories: 76, protein: 8, carbohydrates: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7 },
      
      // Protein Supplements
      'whey protein': { calories: 380, protein: 80, carbohydrates: 6, fat: 4, fiber: 1, sugar: 4, sodium: 200 },
      'whey': { calories: 380, protein: 80, carbohydrates: 6, fat: 4, fiber: 1, sugar: 4, sodium: 200 },
      'protein powder': { calories: 380, protein: 80, carbohydrates: 6, fat: 4, fiber: 1, sugar: 4, sodium: 200 },
      'casein protein': { calories: 360, protein: 75, carbohydrates: 8, fat: 2, fiber: 0, sugar: 6, sodium: 180 },
      
      // Carbohydrates
      'rice': { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
      'white rice': { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 },
      'brown rice': { calories: 111, protein: 2.6, carbohydrates: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5 },
      'bread': { calories: 265, protein: 9, carbohydrates: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 },
      'pasta': { calories: 131, protein: 5, carbohydrates: 25, fat: 1.1, fiber: 1.8, sugar: 0.8, sodium: 6 },
      'potato': { calories: 77, protein: 2, carbohydrates: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 },
      'sweet potato': { calories: 86, protein: 1.6, carbohydrates: 20, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 6 },
      'oats': { calories: 68, protein: 2.4, carbohydrates: 12, fat: 1.4, fiber: 1.7, sugar: 0.3, sodium: 49 },
      
      // Vegetables
      'broccoli': { calories: 34, protein: 2.8, carbohydrates: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33 },
      'spinach': { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
      'carrots': { calories: 41, protein: 0.9, carbohydrates: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
      'tomato': { calories: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5 },
      'cucumber': { calories: 16, protein: 0.7, carbohydrates: 4, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2 },
      'lettuce': { calories: 15, protein: 1.4, carbohydrates: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28 },
      'onion': { calories: 40, protein: 1.1, carbohydrates: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4 },
      'bell pepper': { calories: 31, protein: 1, carbohydrates: 7, fat: 0.3, fiber: 2.5, sugar: 4.2, sodium: 4 },
      
      // Fruits
      'banana': { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1 },
      'apple': { calories: 52, protein: 0.3, carbohydrates: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1 },
      'orange': { calories: 47, protein: 0.9, carbohydrates: 12, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
      'strawberry': { calories: 32, protein: 0.7, carbohydrates: 8, fat: 0.3, fiber: 2, sugar: 4.9, sodium: 1 },
      'grapes': { calories: 62, protein: 0.6, carbohydrates: 16, fat: 0.2, fiber: 0.9, sugar: 16, sodium: 3 },
      
      // Nuts & Seeds
      'almonds': { calories: 579, protein: 21, carbohydrates: 22, fat: 50, fiber: 12, sugar: 4.4, sodium: 1 },
      'walnuts': { calories: 654, protein: 15, carbohydrates: 14, fat: 65, fiber: 6.7, sugar: 2.6, sodium: 2 },
      'peanuts': { calories: 567, protein: 26, carbohydrates: 16, fat: 49, fiber: 8.5, sugar: 4.7, sodium: 18 },
      
      // Dairy
      'milk': { calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44 },
      'yogurt': { calories: 59, protein: 10, carbohydrates: 3.6, fat: 0.4, fiber: 0, sugar: 3.6, sodium: 36 },
      'cheese': { calories: 113, protein: 7, carbohydrates: 1, fat: 9, fiber: 0, sugar: 1, sodium: 621 },
    };

    // Find nutrition data with fuzzy matching
    const lowerFoodName = foodName.toLowerCase().trim();
    let baseNutrition = nutritionDatabase[lowerFoodName];
    
    // Try partial matching if exact match not found
    if (!baseNutrition) {
      for (const [key, value] of Object.entries(nutritionDatabase)) {
        if (lowerFoodName.includes(key) || key.includes(lowerFoodName)) {
          baseNutrition = value;
          break;
        }
      }
    }
    
    // Default fallback to generic values
    if (!baseNutrition) {
      baseNutrition = { calories: 100, protein: 5, carbohydrates: 15, fat: 3, fiber: 2, sugar: 2, sodium: 50 };
    }

    // Convert quantity to grams and calculate scaling factor
    const gramsQuantity = this.convertToGrams(quantity, unit);
    const scaleFactor = gramsQuantity / 100; // Database values are per 100g

    return {
      calories: Math.round(baseNutrition.calories * scaleFactor * 100) / 100,
      protein: Math.round(baseNutrition.protein * scaleFactor * 100) / 100,
      carbohydrates: Math.round(baseNutrition.carbohydrates * scaleFactor * 100) / 100,
      fat: Math.round(baseNutrition.fat * scaleFactor * 100) / 100,
      fiber: baseNutrition.fiber ? Math.round(baseNutrition.fiber * scaleFactor * 100) / 100 : undefined,
      sugar: baseNutrition.sugar ? Math.round(baseNutrition.sugar * scaleFactor * 100) / 100 : undefined,
      sodium: baseNutrition.sodium ? Math.round(baseNutrition.sodium * scaleFactor * 100) / 100 : undefined,
    };
  }
}