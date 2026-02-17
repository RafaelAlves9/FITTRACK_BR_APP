/**
 * Foods Service - Manage custom foods
 */

import { storage, STORAGE_KEYS } from './storage';
import { foodCatalog, type Food } from '@/constants/foods';

export interface CustomFood extends Food {
  user_email: string;
  created_at: string;
}

/**
 * Add custom food
 */
export async function addCustomFood(userEmail: string | undefined, food: Omit<Food, 'id'>): Promise<CustomFood> {
  const email = (userEmail && userEmail.trim()) ? userEmail : 'local-user';
  const customFood: CustomFood = {
    ...food,
    id: `custom-${Date.now()}-${Math.random()}`,
    user_email: email,
    created_at: new Date().toISOString(),
  };

  await storage.addItem(STORAGE_KEYS.CUSTOM_FOODS, customFood);
  return customFood;
}

/**
 * Get all custom foods for user
 */
export async function getCustomFoods(userEmail: string | undefined): Promise<CustomFood[]> {
  const all = await storage.getItem<CustomFood>(STORAGE_KEYS.CUSTOM_FOODS);
  const email = (userEmail && userEmail.trim()) ? userEmail : 'local-user';
  // incluir também itens 'local-user' para usuários autenticados (migrados/offline)
  const allowed = new Set([email, 'local-user']);
  return all.filter(f => allowed.has(f.user_email));
}

/**
 * Search foods (base catalog + custom foods)
 */
export async function searchAllFoods(userEmail: string, query: string): Promise<Food[]> {
  const lowerQuery = query.toLowerCase();
  
  // Search in base catalog
  const baseResults = foodCatalog.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  );
  
  // Search in custom foods
  const customFoods = await getCustomFoods(userEmail);
  const customResults = customFoods.filter(food =>
    food.name.toLowerCase().includes(lowerQuery) ||
    food.category.toLowerCase().includes(lowerQuery)
  );
  
  // Combine and limit results
  return [...customResults, ...baseResults].slice(0, 30);
}

/**
 * Get food by ID (from base catalog or custom)
 */
export async function getFoodById(userEmail: string, foodId: string): Promise<Food | undefined> {
  // Check base catalog first
  const baseFood = foodCatalog.find(f => f.id === foodId);
  if (baseFood) return baseFood;
  
  // Check custom foods
  const customFoods = await getCustomFoods(userEmail);
  return customFoods.find(f => f.id === foodId);
}

/**
 * Delete custom food
 */
export async function deleteCustomFood(foodId: string): Promise<void> {
  await storage.deleteItem(STORAGE_KEYS.CUSTOM_FOODS, foodId);
}

/**
 * Find existing food by name (case insensitive)
 */
export async function findFoodByName(userEmail: string, name: string): Promise<Food | undefined> {
  const normalizedName = name.toLowerCase().trim();
  
  // Check base catalog first
  const baseFood = foodCatalog.find(f => 
    f.name.toLowerCase().trim() === normalizedName
  );
  if (baseFood) return baseFood;
  
  // Check custom foods
  const customFoods = await getCustomFoods(userEmail);
  return customFoods.find(f => 
    f.name.toLowerCase().trim() === normalizedName
  );
}

/**
 * Add custom food with duplication check
 */
export async function addCustomFoodWithDuplicationCheck(
  userEmail: string | undefined, 
  food: Omit<Food, 'id'>
): Promise<{ food: Food; isNew: boolean }> {
  const email = (userEmail && userEmail.trim()) ? userEmail : 'local-user';
  
  // Check if food already exists
  const existingFood = await findFoodByName(email, food.name);
  
  if (existingFood) {
    return { food: existingFood, isNew: false };
  }
  
  // Create new food if it doesn't exist
  const newFood = await addCustomFood(email, food);
  return { food: newFood, isNew: true };
}
