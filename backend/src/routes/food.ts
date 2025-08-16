import express from 'express';
import FoodEntry from '../models/FoodEntry';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { NutritionService } from '../services/nutritionService';

const router = express.Router();

// Nutrition lookup endpoint
router.post('/nutrition-lookup', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { foodName, quantity, unit, foodDescription } = req.body;

    // Handle free-text description mode
    if (foodDescription) {
      const nutritionData = await NutritionService.getNutritionDataFromDescription(foodDescription);
      return res.json({
        message: 'Nutrition data retrieved successfully from description',
        nutrition: nutritionData
      });
    }

    // Handle traditional quantity + unit mode
    if (!foodName || !quantity || !unit) {
      return res.status(400).json({ 
        message: 'Either foodDescription OR (foodName, quantity, and unit) are required' 
      });
    }

    const nutritionData = await NutritionService.getNutritionData(foodName, quantity, unit);

    res.json({
      message: 'Nutrition data retrieved successfully',
      nutrition: nutritionData
    });
  } catch (error) {
    console.error('Nutrition lookup error:', error);
    
    // Fallback to basic nutrition data
    try {
      const fallbackData = await NutritionService.getNutritionDataFallback(
        req.body.foodName, 
        req.body.quantity, 
        req.body.unit
      );
      
      res.json({
        message: 'Nutrition data retrieved (fallback)',
        nutrition: fallbackData
      });
    } catch (fallbackError) {
      res.status(500).json({ 
        message: 'Failed to retrieve nutrition data', 
        error: fallbackError 
      });
    }
  }
});

router.post('/log', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      date,
      foodName,
      brand,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
      fiber,
      sugar,
      sodium,
      meal
    } = req.body;

    const foodEntry = new FoodEntry({
      userId: req.userId,
      date: new Date(date),
      foodName,
      brand,
      quantity,
      unit,
      calories,
      protein,
      carbohydrates,
      fat,
      fiber,
      sugar,
      sodium,
      meal
    });

    await foodEntry.save();

    res.status(201).json({
      message: 'Food entry logged successfully',
      entry: foodEntry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/entries/:date', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const entries = await FoodEntry.find({
      userId: req.userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ createdAt: -1 });

    const totals = entries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbohydrates: acc.carbohydrates + entry.carbohydrates,
      fat: acc.fat + entry.fat,
      fiber: acc.fiber + (entry.fiber || 0),
      sugar: acc.sugar + (entry.sugar || 0),
      sodium: acc.sodium + (entry.sodium || 0)
    }), {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });

    const groupedByMeal = entries.reduce((acc, entry) => {
      if (!acc[entry.meal]) {
        acc[entry.meal] = [];
      }
      acc[entry.meal].push(entry);
      return acc;
    }, {} as Record<string, typeof entries>);

    res.json({
      date,
      entries: groupedByMeal,
      totals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/entries/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    res.json({
      message: 'Food entry updated successfully',
      entry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/entries/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const entry = await FoodEntry.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!entry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }

    res.json({ message: 'Food entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;