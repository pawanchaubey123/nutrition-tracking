import mongoose, { Document, Schema } from 'mongoose';

export interface IFoodEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  foodName: string;
  brand?: string;
  quantity: number;
  unit: string; // grams, cups, pieces, etc.
  calories: number;
  protein: number; // in grams
  carbohydrates: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: Date;
  updatedAt: Date;
}

const FoodEntrySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  foodName: { type: String, required: true },
  brand: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbohydrates: { type: Number, required: true },
  fat: { type: Number, required: true },
  fiber: { type: Number },
  sugar: { type: Number },
  sodium: { type: Number },
  meal: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack'], 
    required: true 
  },
}, {
  timestamps: true
});

export default mongoose.model<IFoodEntry>('FoodEntry', FoodEntrySchema);