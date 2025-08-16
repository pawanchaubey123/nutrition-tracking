'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';

const onboardingSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  weight: z.number().min(30, 'Weight must be at least 30 kg').max(300, 'Weight must be less than 300 kg'),
  height: z.number().min(100, 'Height must be at least 100 cm').max(250, 'Height must be less than 250 cm'),
  age: z.number().min(13, 'Age must be at least 13').max(120, 'Age must be less than 120'),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  currentBodyFatPercentage: z.number().min(5, 'Body fat must be at least 5%').max(50, 'Body fat must be less than 50%'),
  targetBodyFatPercentage: z.number().min(5, 'Target body fat must be at least 5%').max(50, 'Target body fat must be less than 50%'),
  goal: z.enum(['lose_weight', 'maintain_weight', 'gain_weight'])
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onComplete: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export default function OnboardingForm({ onComplete, onSwitchToLogin }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema)
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['email', 'password', 'firstName', 'lastName'];
    } else if (step === 2) {
      fieldsToValidate = ['weight', 'height', 'age', 'gender', 'activityLevel'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, data);
      localStorage.setItem('token', response.data.token);
      onComplete(response.data.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Create Your Account</h2>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">First Name</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Last Name</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Weight (kg)</label>
                <input
                  {...register('weight', { valueAsNumber: true })}
                  type="number"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Height (cm)</label>
                <input
                  {...register('height', { valueAsNumber: true })}
                  type="number"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="175"
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Age</label>
                <input
                  {...register('age', { valueAsNumber: true })}
                  type="number"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25"
                />
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Activity Level</label>
              <select
                {...register('activityLevel')}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select activity level</option>
                <option value="sedentary">Sedentary (little to no exercise)</option>
                <option value="light">Light (light exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                <option value="active">Active (hard exercise 6-7 days/week)</option>
                <option value="very_active">Very Active (very hard exercise, physical job)</option>
              </select>
              {errors.activityLevel && <p className="text-red-500 text-sm mt-1">{errors.activityLevel.message}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-white">Body Composition & Goals</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Current Body Fat %</label>
                <input
                  {...register('currentBodyFatPercentage', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15.0"
                />
                {errors.currentBodyFatPercentage && <p className="text-red-500 text-sm mt-1">{errors.currentBodyFatPercentage.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Target Body Fat %</label>
                <input
                  {...register('targetBodyFatPercentage', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12.0"
                />
                {errors.targetBodyFatPercentage && <p className="text-red-500 text-sm mt-1">{errors.targetBodyFatPercentage.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Goal</label>
              <select
                {...register('goal')}
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="maintain_weight">Maintain Weight</option>
                <option value="gain_weight">Gain Weight</option>
              </select>
              {errors.goal && <p className="text-red-500 text-sm mt-1">{errors.goal.message}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-300">Step {step} of 3</span>
            <span className="text-sm text-gray-300">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Complete Setup'}</button>
            )}
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}