import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import foodRoutes from './routes/food';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8000', 10);

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:3000',
  'https://nutriitracker.netlify.app', // Update this with your actual Netlify URL
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

console.log('mongodb uri', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/health_tracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Health tracker API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});