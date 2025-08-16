import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { NutritionCalculator } from '../utils/nutritionCalculator';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      weight,
      height,
      age,
      gender,
      activityLevel,
      currentBodyFatPercentage,
      targetBodyFatPercentage,
      goal
    } = req.body;

    console.log('req.body', req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const macroTargets = NutritionCalculator.calculateMacroTargets({
      weight,
      height,
      age,
      gender,
      activityLevel,
      currentBodyFatPercentage,
      targetBodyFatPercentage,
      goal
    });

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      weight,
      height,
      age,
      gender,
      activityLevel,
      currentBodyFatPercentage,
      targetBodyFatPercentage,
      goal,
      dailyCalorieTarget: macroTargets.calories,
      dailyProteinTarget: macroTargets.protein,
      dailyCarbTarget: macroTargets.carbohydrates,
      dailyFatTarget: macroTargets.fat
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        targets: {
          calories: user.dailyCalorieTarget,
          protein: user.dailyProteinTarget,
          carbohydrates: user.dailyCarbTarget,
          fat: user.dailyFatTarget
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        targets: {
          calories: user.dailyCalorieTarget,
          protein: user.dailyProteinTarget,
          carbohydrates: user.dailyCarbTarget,
          fat: user.dailyFatTarget
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;