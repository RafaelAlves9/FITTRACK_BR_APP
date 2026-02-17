/**
 * Exercises Service
 * Manages default exercises database and user custom exercises
 */

import { Exercise, ExerciseType, ExerciseCategory } from '@/types/customWorkout';
import { storage, STORAGE_KEYS } from './storage';
import { executeQuery, executeInsert, executeUpdate, executeDelete } from './database';
import { generateUUID } from '@/utils/uuid';
import { getBrazilDateTime } from '@/utils/dateUtils';
import { devLog, devWarn, devError } from '@/utils/logger';

// Storage key for exercises
const EXERCISES_KEY = STORAGE_KEYS.EXERCISES;

// Helper to safely parse JSON fields
const safeJsonParse = (value: any, fallback: any = []) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value; // Already parsed
  try {
    return JSON.parse(value);
  } catch (e) {
    // If parse fails, try to handle as comma-separated string or single value
    if (typeof value === 'string') {
        // Check if it looks like a list
        if (value.includes(',')) {
            return value.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [value];
    }
    devWarn('[Exercises] Failed to parse JSON field:', value, e);
    return fallback;
  }
};

/**
 * Initialize exercises database
 * Inserts default exercises if not already present
 */
export const initializeExercises = async (): Promise<void> => {
  try {
    // Check if exercises exist (handling potential table missing error)
    let existing: Exercise[] = [];
    try {
      existing = await getAllExercises();
    } catch (e) {
      devLog('[Exercises] Table might not exist yet, proceeding to initialization');
    }
    
    // No longer seeding default exercises locally.
    // They will be fetched from the backend via syncPullData.
    if (existing.length === 0) {
      devLog('[Exercises] No exercises found locally. Waiting for sync.');
    }
  } catch (error) {
    devError('[Exercises] Error initializing exercises:', error);
  }
};

/**
 * Get all exercises (optionally filtered by user)
 */
export const getAllExercises = async (userId?: string): Promise<Exercise[]> => {
  try {
    // Ensure DB is initialized before accessing raw object
    const db = (storage as any).db;
    if (!db) return [];

    const sql = userId 
      ? 'SELECT * FROM exercises WHERE user_id IS NULL OR user_id = ? ORDER BY name'
      : 'SELECT * FROM exercises WHERE user_id IS NULL ORDER BY name';
      
    const params = userId ? [userId] : [];

    const rows = await db.getAllAsync(sql, params);
    return rows.map((row: any) => ({
      ...row,
      target_muscles: safeJsonParse(row.target_muscles),
    }));
  } catch (error: any) {
    // Ignore "no such table" error as it just means not initialized yet
    if (!error?.message?.includes('no such table')) {
        devError('[Exercises] Error getting all exercises:', error);
    }
    return [];
  }
};

/**
 * Get exercises by type
 */
export const getExercisesByType = async (type: ExerciseType, userId?: string): Promise<Exercise[]> => {
  try {
    const db = (storage as any).db;
    if (!db) return [];

    const sql = userId
      ? 'SELECT * FROM exercises WHERE type = ? AND (user_id IS NULL OR user_id = ?) ORDER BY name'
      : 'SELECT * FROM exercises WHERE type = ? AND user_id IS NULL ORDER BY name';
    
    const params = userId ? [type, userId] : [type];

    const rows = await db.getAllAsync(sql, params);
    return rows.map((row: any) => ({
      ...row,
      target_muscles: safeJsonParse(row.target_muscles),
    }));
  } catch (error) {
    devError('[Exercises] Error getting exercises by type:', error);
    return [];
  }
};

/**
 * Get exercises by category
 */
export const getExercisesByCategory = async (category: ExerciseCategory, userId?: string): Promise<Exercise[]> => {
  try {
    const db = (storage as any).db;
    if (!db) return [];

    const sql = userId
      ? 'SELECT * FROM exercises WHERE category = ? AND (user_id IS NULL OR user_id = ?) ORDER BY name'
      : 'SELECT * FROM exercises WHERE category = ? AND user_id IS NULL ORDER BY name';

    const params = userId ? [category, userId] : [category];

    const rows = await db.getAllAsync(sql, params);
    return rows.map((row: any) => ({
      ...row,
      target_muscles: safeJsonParse(row.target_muscles),
    }));
  } catch (error) {
    devError('[Exercises] Error getting exercises by category:', error);
    return [];
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (id: string): Promise<Exercise | null> => {
  try {
    const db = (storage as any).db;
    if (!db) return null;

    const row = await db.getFirstAsync(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );
    
    if (!row) return null;
    
    return {
      ...(row as any),
      target_muscles: safeJsonParse((row as any).target_muscles),
    };
  } catch (error) {
    devError('[Exercises] Error getting exercise by ID:', error);
    return null;
  }
};

/**
 * Search exercises by name
 */
export const searchExercises = async (query: string, userId?: string): Promise<Exercise[]> => {
  try {
    const db = (storage as any).db;
    if (!db) return [];

    const sql = userId
      ? 'SELECT * FROM exercises WHERE name LIKE ? AND (user_id IS NULL OR user_id = ?) ORDER BY name'
      : 'SELECT * FROM exercises WHERE name LIKE ? AND user_id IS NULL ORDER BY name';

    const params = userId ? [`%${query}%`, userId] : [`%${query}%`];

    const rows = await db.getAllAsync(sql, params);
    return rows.map((row: any) => ({
      ...row,
      target_muscles: safeJsonParse(row.target_muscles),
    }));
  } catch (error) {
    devError('[Exercises] Error searching exercises:', error);
    return [];
  }
};

/**
 * Get exercises grouped by category
 */
export const getExercisesGroupedByCategory = async (
  type?: ExerciseType,
  userId?: string
): Promise<Record<ExerciseCategory, Exercise[]>> => {
  try {
    const exercises = type 
      ? await getExercisesByType(type, userId) 
      : await getAllExercises(userId);
    
    const grouped: Record<string, Exercise[]> = {};
    
    exercises.forEach(exercise => {
      if (!grouped[exercise.category]) {
        grouped[exercise.category] = [];
      }
      grouped[exercise.category].push(exercise);
    });
    
    return grouped as Record<ExerciseCategory, Exercise[]>;
  } catch (error) {
    devError('[Exercises] Error grouping exercises:', error);
    return {} as Record<ExerciseCategory, Exercise[]>;
  }
};

/**
 * Create a new user defined exercise
 */
export const createExercise = async (exercise: Omit<Exercise, 'id'> & { user_id: string }): Promise<string> => {
    try {
        const id = generateUUID();
        const newExercise: Exercise = {
            id,
            ...exercise
        };
        
        await executeInsert(STORAGE_KEYS.EXERCISES, newExercise);
        return id;
    } catch (error) {
        devError('[Exercises] Error creating exercise:', error);
        throw error;
    }
};

/**
 * Delete a user defined exercise
 */
export const deleteExercise = async (id: string, userId: string): Promise<void> => {
    try {
        // Verify ownership
        const exercise = await getExerciseById(id);
        if (!exercise) throw new Error("Exercise not found");
        if (exercise.user_id !== userId) throw new Error("Unauthorized");

        await executeDelete(STORAGE_KEYS.EXERCISES, id);
    } catch (error) {
        devError('[Exercises] Error deleting exercise:', error);
        throw error;
    }
};

