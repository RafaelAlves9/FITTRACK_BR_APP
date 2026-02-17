import { STORAGE_KEYS, executeInsert, executeQuery, executeUpdate } from './database';
import { generateUUID } from '@/utils/uuid';

export interface NutritionGoals {
  id: string;
  user_id: string;
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  updated_at: string;
  synced?: boolean | number;
}

export async function getNutritionGoals(userId: string): Promise<NutritionGoals | null> {
  const items = await executeQuery<NutritionGoals>(STORAGE_KEYS.NUTRITION_GOALS, g => g.user_id === userId);
  if (items.length === 0) return null;
  // Return the latest by updated_at
  return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
}

export async function getNutritionGoalsHistory(userId: string): Promise<NutritionGoals[]> {
  const items = await executeQuery<NutritionGoals>(STORAGE_KEYS.NUTRITION_GOALS, g => g.user_id === userId);
  return items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export async function upsertNutritionGoals(userId: string, payload: Omit<NutritionGoals, 'id' | 'user_id' | 'updated_at'>): Promise<NutritionGoals> {
  // Always insert a new record to keep history
  const now = new Date().toISOString();
  
  const newItem: NutritionGoals = {
    id: generateUUID(),
    user_id: userId,
    daily_calories: payload.daily_calories,
    protein_g: payload.protein_g,
    carbs_g: payload.carbs_g,
    fat_g: payload.fat_g,
    water_ml: payload.water_ml, // Ensure water_ml is passed through
    updated_at: now,
    synced: 0,
  };
  
  await executeInsert<NutritionGoals>(STORAGE_KEYS.NUTRITION_GOALS, newItem);
  return newItem;
}


