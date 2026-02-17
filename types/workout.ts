/**
 * Workout Types - New workout module
 * Types for pre-built workouts system
 */

// Workout difficulty levels
export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';

// Workout categories
export type WorkoutCategory = 
  | 'musculation' 
  | 'yoga' 
  | 'crossfit' 
  | 'cardio' 
  | 'stretching' 
  | 'functional';

// Exercise within a workout
export interface WorkoutExercise {
  id: string;
  name: string;
  duration: number; // Duration in seconds
  imageUrl: string;
  videoUrl: string; // YouTube embed URL
  description?: string;
  targetMuscles?: string[];
  caloriesPerMinute: number;
  calories_per_minute?: number; // DB snake_case
}

// Pre-built workout
export interface PresetWorkout {
  id: string;
  name: string;
  description: string;
  level: WorkoutLevel;
  category: WorkoutCategory;
  imageUrl: string;
  duration: number; // Total duration in minutes
  exerciseCount: number;
  estimatedCalories: number;
  exercises: WorkoutExercise[];
  isFeatured?: boolean;
}

// User's favorite workout
export interface FavoriteWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  created_at: string;
}

// Completed workout session
export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_id: string;
  workout_name: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number; // Actual duration
  exercises_completed: number;
  total_exercises: number;
  calories_burned: number;
}

// Exercise execution state during workout session
export interface ExerciseExecutionState {
  currentExerciseIndex: number;
  isResting: boolean;
  remainingTime: number; // Seconds
  totalElapsedTime: number; // Seconds
  exercisesCompleted: number;
  caloriesBurned: number;
}

// Workout filter options
export interface WorkoutFilters {
  level?: WorkoutLevel;
  category?: WorkoutCategory;
  minDuration?: number;
  maxDuration?: number;
  searchQuery?: string;
}

// Workout completion summary
export interface WorkoutCompleteSummary {
  workoutId: string;
  workoutName: string;
  exercisesCompleted: number;
  totalExercises: number;
  caloriesBurned: number;
  totalDuration: number; // in seconds
  startedAt: string;
  completedAt: string;
}

