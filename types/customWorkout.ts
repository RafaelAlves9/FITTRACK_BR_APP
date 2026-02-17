/**
 * Custom Workout Types
 * Types for user-created workouts with exercises
 */

// Exercise categories
export type ExerciseCategory =
  | 'Peito'
  | 'Costas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Perna'
  | 'Abdômen'
  | 'Glúteos'
  | 'Cardio'
  | 'Funcional'
  | 'Personalizado';

// Exercise type
export type ExerciseType = 'musculacao' | 'aerobico';

// Base exercise from database
export interface Exercise {
  id: string;
  user_id?: string | null; // Null if system default, string if user created
  name: string;
  type: ExerciseType;
  category: ExerciseCategory;
  description: string;
  gif_url?: string;
  image_url?: string;
  target_muscles?: string[];
  calories_per_hour?: number;
  calories_per_12_reps?: number;
  default_sets?: number;
  default_reps?: number;
  default_weight?: number;
  default_duration?: number; // in minutes for aerobic
}

// Exercise in a workout with user values
export interface WorkoutExerciseItem {
  exerciseId: string;
  exerciseName: string;
  exerciseType: ExerciseType;
  category: ExerciseCategory;
  image_url?: string;
  gif_url?: string;
  // Musculação fields
  sets?: number;
  reps?: number;
  weight?: number; // in kg
  // Aeróbico fields
  duration?: number; // in minutes
  distance?: number; // in km
}

// Custom workout created by user
export interface CustomWorkout {
  id: string;
  user_id: string;
  name: string;
  type: ExerciseType;
  exercises: WorkoutExerciseItem[];
  created_at: string;
  last_done: string | null;
  times_done: number;
  total_exercises?: number;
  estimated_calories?: number;
}

// Exercise history entry
export interface ExerciseHistoryEntry {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_type: ExerciseType;
  date: string;
  created_at: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

// Exercise with evolution data
export interface ExerciseWithHistory {
  exercise: Exercise;
  latestValues?: WorkoutExerciseItem;
  history: ExerciseHistoryEntry[];
  notes?: string;
}

// Workout statistics
export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  estimatedCalories: number;
  lastWorkoutDate: string | null;
}

