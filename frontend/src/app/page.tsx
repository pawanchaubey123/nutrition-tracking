'use client';

import { useState, useEffect } from 'react';
import OnboardingForm from '@/components/OnboardingForm';
import LoginForm from '@/components/LoginForm';
import Dashboard from '@/components/Dashboard';
import FoodLogger from '@/components/FoodLogger';

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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showFoodLogger, setShowFoodLogger] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const handleFoodAdded = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setShowLogin(false)}
        />
      );
    } else {
      return (
        <OnboardingForm 
          onComplete={handleOnboardingComplete}
          onSwitchToLogin={() => setShowLogin(true)}
        />
      );
    }
  }

  return (
    <>
      <Dashboard 
        user={user} 
        onAddFood={() => setShowFoodLogger(true)}
        onLogout={handleLogout}
      />
      
      {showFoodLogger && (
        <FoodLogger
          onClose={() => setShowFoodLogger(false)}
          onFoodAdded={handleFoodAdded}
        />
      )}
    </>
  );
}
