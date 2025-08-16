import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  currentBodyFatPercentage: number;
  targetBodyFatPercentage: number;
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  dailyCalorieTarget: number;
  dailyProteinTarget: number; // in grams
  dailyCarbTarget: number; // in grams
  dailyFatTarget: number; // in grams
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'], 
    required: true 
  },
  currentBodyFatPercentage: { type: Number, required: true },
  targetBodyFatPercentage: { type: Number, required: true },
  goal: { 
    type: String, 
    enum: ['lose_weight', 'maintain_weight', 'gain_weight'], 
    required: true 
  },
  dailyCalorieTarget: { type: Number, required: true },
  dailyProteinTarget: { type: Number, required: true },
  dailyCarbTarget: { type: Number, required: true },
  dailyFatTarget: { type: Number, required: true },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);