/**
 * Recipes Service - Manage recurring meal recipes
 */

import { storage, STORAGE_KEYS } from './storage';

export interface RecipeFood {
  food_id: string;
  food_name: string;
  grams: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Recipe {
  id: string;
  user_email: string;
  name: string;
  foods: RecipeFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  created_at: string;
  times_used: number;
}

/**
 * Create recipe
 */
export async function createRecipe(
  userEmail: string,
  name: string,
  foods: RecipeFood[]
): Promise<Recipe> {
  // Calculate totals
  const totals = foods.reduce((acc, food) => ({
    calories: acc.calories + food.nutrition.calories,
    protein: acc.protein + food.nutrition.protein,
    carbs: acc.carbs + food.nutrition.carbs,
    fat: acc.fat + food.nutrition.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const recipe: Recipe = {
    id: `recipe-${Date.now()}-${Math.random()}`,
    user_email: userEmail,
    name,
    foods,
    total_calories: totals.calories,
    total_protein: totals.protein,
    total_carbs: totals.carbs,
    total_fat: totals.fat,
    created_at: new Date().toISOString(),
    times_used: 0,
  };

  await storage.addItem(STORAGE_KEYS.RECIPES, recipe);
  return recipe;
}

/**
 * Get all recipes for user
 */
export async function getRecipes(userEmail: string): Promise<Recipe[]> {
  const all = await storage.getItem<Recipe>(STORAGE_KEYS.RECIPES);
  return all
    .filter(r => r.user_email === userEmail)
    .sort((a, b) => b.times_used - a.times_used); // Most used first
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(recipeId: string): Promise<Recipe | undefined> {
  const all = await storage.getItem<Recipe>(STORAGE_KEYS.RECIPES);
  return all.find(r => r.id === recipeId);
}

/**
 * Update recipe usage count
 */
export async function incrementRecipeUsage(recipeId: string): Promise<void> {
  const recipe = await getRecipeById(recipeId);
  if (recipe) {
    await storage.updateItem(STORAGE_KEYS.RECIPES, recipeId, {
      times_used: recipe.times_used + 1,
    });
  }
}

/**
 * Delete recipe
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  await storage.deleteItem(STORAGE_KEYS.RECIPES, recipeId);
}

/**
 * Update recipe
 */
export async function updateRecipe(
  recipeId: string,
  updates: Partial<Pick<Recipe, 'name' | 'foods'>>
): Promise<void> {
  if (updates.foods) {
    // Recalculate totals if foods changed
    const totals = updates.foods.reduce((acc, food) => ({
      calories: acc.calories + food.nutrition.calories,
      protein: acc.protein + food.nutrition.protein,
      carbs: acc.carbs + food.nutrition.carbs,
      fat: acc.fat + food.nutrition.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    await storage.updateItem(STORAGE_KEYS.RECIPES, recipeId, {
      ...updates,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
    });
  } else {
    await storage.updateItem(STORAGE_KEYS.RECIPES, recipeId, updates);
  }
}
