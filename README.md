# Daily Health Check - Nutrition Tracking App

A comprehensive web application for tracking daily calories and macro nutrients with personalized targets based on user metrics and goals.

## Features

- 🤖 **AI-Powered Nutrition Analysis**: Google Gemini AI analyzes complex meals and provides accurate nutrition data
- 🍽️ **Dual Food Entry Modes**: Simple mode (100g chicken) or Complex mode (1 plate kadhi chawal with chana)
- 💪 **Body Recomposition Focus**: 1.8g protein per kg body weight formula for muscle building
- 📊 **Smart Macro Calculation**: BMR, TDEE, and personalized macro targets based on your goals
- 🗑️ **Food Management**: View, edit, and delete food entries with detailed nutrition breakdowns
- 📈 **Visual Progress Tracking**: Real-time progress bars and daily nutrition summaries
- 🔐 **Secure Authentication**: JWT-based login/registration system
- 🌙 **Modern UI**: Dark theme with responsive design

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form** with **Zod** validation
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication
- **bcrypt** for password hashing

## Project Structure

```
daily_health_check/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main app component
│   │   │   ├── layout.tsx   # Root layout
│   │   │   └── globals.css  # Global styles
│   │   └── components/
│   │       ├── OnboardingForm.tsx  # User registration & metrics
│   │       ├── Dashboard.tsx       # Nutrition progress dashboard
│   │       └── FoodLogger.tsx      # Food entry form
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── server.ts        # Express server setup
│   │   ├── models/
│   │   │   ├── User.ts      # User schema with metrics
│   │   │   └── FoodEntry.ts # Food entry schema
│   │   ├── routes/
│   │   │   ├── auth.ts      # Authentication routes
│   │   │   └── food.ts      # Food logging routes
│   │   ├── middleware/
│   │   │   └── auth.ts      # JWT authentication middleware
│   │   └── utils/
│   │       └── nutritionCalculator.ts  # BMR/TDEE calculations
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/health_tracker
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

### Database Setup

1. **Local MongoDB**: Install MongoDB locally and ensure it's running on port 27017
2. **MongoDB Atlas**: Create a cluster and update the `MONGODB_URI` in your `.env` file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with metrics
- `POST /api/auth/login` - User login

### Food Logging
- `POST /api/food/log` - Log a food entry
- `GET /api/food/entries/:date` - Get food entries for a specific date
- `PUT /api/food/entries/:id` - Update a food entry
- `DELETE /api/food/entries/:id` - Delete a food entry

## Nutrition Calculation Features

### BMR (Basal Metabolic Rate)
Uses the Mifflin-St Jeor Equation:
- **Men**: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age)
- **Women**: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age)

### TDEE (Total Daily Energy Expenditure)
BMR multiplied by activity factor:
- **Sedentary**: BMR × 1.2
- **Light Activity**: BMR × 1.375
- **Moderate Activity**: BMR × 1.55
- **Active**: BMR × 1.725
- **Very Active**: BMR × 1.9

### Macro Distribution
- **Weight Loss**: 30% protein, 25% fat, 45% carbs
- **Maintenance**: 25% protein, 25% fat, 50% carbs
- **Weight Gain**: 25% protein, 30% fat, 45% carbs

## Usage

1. **First Time Setup**:
   - Create an account with email and password
   - Enter your physical metrics (weight, height, age, gender)
   - Specify your activity level and goals
   - The app automatically calculates your daily calorie and macro targets

2. **Daily Tracking**:
   - Use the dashboard to view your daily progress
   - Click "Add Food" to log meals throughout the day
   - Monitor your progress with visual indicators
   - Switch between dates to view historical data

3. **Food Logging**:
   - Enter food name, quantity, and unit
   - Specify meal type (breakfast, lunch, dinner, snack)
   - Add detailed nutrition information (calories, protein, carbs, fat)
   - Optional fields for fiber, sugar, and sodium

## Development

### Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Future Enhancements

- Food database integration (USDA, Open Food Facts)
- Barcode scanning for easy food entry
- Progress photos and body measurements tracking
- Meal planning and recipe suggestions
- Social features and progress sharing
- Mobile app development
- Nutritionist consultation integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.