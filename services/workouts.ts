/**
 * Workouts Service - CRUD operations for workouts
 */

import { storage, STORAGE_KEYS } from './storage';
import { generateUUID } from '@/utils/uuid';
import { logAction } from './actionLogs';
import { devError } from '@/utils/logger';

export interface WorkoutExercise {
  exerciseId: string;
  sets?: number; // Para musculação
  reps?: number; // Para musculação
  weight?: number; // Para musculação (kg)
  duration?: number; // Para aeróbico (minutos)
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  type: 'musculacao' | 'aerobico';
  exercises: WorkoutExercise[];
  created_at: string;
  last_done?: string;
  times_done: number;
}

export interface WorkoutHistory {
  id: string;
  workout_id: string;
  exercise_id: string;
  date: string;
  weight?: number;
  sets?: number;
  reps?: number;
}

const STORAGE_KEY = STORAGE_KEYS.WORKOUTS;
const HISTORY_KEY = 'workout_history';
const keyToTable = (key: string) => key.replace('@fittrack_', '');

// Get all workouts for user
export const getWorkouts = async (userId: string): Promise<Workout[]> => {
  try {
    const allWorkouts = await storage.getItem<Workout>(STORAGE_KEY);
    return allWorkouts.filter(w => w.user_id === userId);
  } catch (error) {
    devError('Error getting workouts:', error);
    return [];
  }
};

// Get single workout
export const getWorkout = async (workoutId: string): Promise<Workout | null> => {
  try {
    const allWorkouts = await storage.getItem<Workout>(STORAGE_KEY);
    return allWorkouts.find(w => w.id === workoutId) || null;
  } catch (error) {
    devError('Error getting workout:', error);
    return null;
  }
};

// Create workout
export const createWorkout = async (workout: Omit<Workout, 'id' | 'created_at' | 'times_done'>): Promise<Workout> => {
  try {
    const newWorkout: Workout = {
      ...workout,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      times_done: 0,
    };
    // Evita regravar a tabela inteira
    await storage.addItem<Workout>(STORAGE_KEY, newWorkout);
    await logAction({
      table: keyToTable(STORAGE_KEY),
      action: 'insert',
      recordId: newWorkout.id,
      payload: newWorkout,
    });
    return newWorkout;
  } catch (error) {
    devError('Error creating workout:', error);
    throw error;
  }
};

// Update workout
export const updateWorkout = async (workoutId: string, updates: Partial<Workout>): Promise<void> => {
  try {
    await storage.updateItem<Workout>(STORAGE_KEY, workoutId, updates);
    await logAction({
      table: keyToTable(STORAGE_KEY),
      action: 'update',
      recordId: workoutId,
      payload: updates,
    });
  } catch (error) {
    devError('Error updating workout:', error);
    throw error;
  }
};

// Delete workout
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    await storage.deleteItem(STORAGE_KEY, workoutId);
    await logAction({
      table: keyToTable(STORAGE_KEY),
      action: 'delete',
      recordId: workoutId,
    });
  } catch (error) {
    devError('Error deleting workout:', error);
    throw error;
  }
};

// Mark workout as done
export const markWorkoutDone = async (workoutId: string): Promise<void> => {
  try {
    await storage.updateItem<Workout>(STORAGE_KEY, workoutId, {
      last_done: new Date().toISOString(),
      // times_done será incrementado de forma segura; se não existir, tratamos como 0
    } as any);
    // Incremento separado para evitar race sobre valor antigo
    const all = await storage.getItem<Workout>(STORAGE_KEY);
    const found = all.find(w => w.id === workoutId);
    if (found) {
      await storage.updateItem<Workout>(STORAGE_KEY, workoutId, { times_done: (found.times_done || 0) + 1 } as any);
    }
    await logAction({
      table: keyToTable(STORAGE_KEY),
      action: 'update',
      recordId: workoutId,
      payload: { last_done: new Date().toISOString() },
    });
  } catch (error) {
    devError('Error marking workout done:', error);
    throw error;
  }
};

// Get workout history for an exercise
export const getExerciseHistory = async (workoutId: string, exerciseId: string): Promise<WorkoutHistory[]> => {
  try {
    const allHistory = await storage.getItem<WorkoutHistory>(HISTORY_KEY);
    return allHistory
      .filter(h => h.workout_id === workoutId && h.exercise_id === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    devError('Error getting exercise history:', error);
    return [];
  }
};

// Add history entry
export const addWorkoutHistory = async (history: Omit<WorkoutHistory, 'id'>): Promise<void> => {
  try {
    const newHistory: WorkoutHistory = {
      ...history,
      id: generateUUID(),
    };
    // Evita regravar a tabela inteira
    await storage.addItem<WorkoutHistory>(HISTORY_KEY, newHistory);
    await logAction({
      table: HISTORY_KEY,
      action: 'insert',
      recordId: newHistory.id,
      payload: newHistory,
    });
  } catch (error) {
    devError('Error adding workout history:', error);
    throw error;
  }
};


