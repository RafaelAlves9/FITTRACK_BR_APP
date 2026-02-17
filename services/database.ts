/**
 * Database Service - SQLite operations (mobile) / AsyncStorage (web)
 * Handles all local database operations with abstraction layer
 * Now logs all write operations for offline-first sync
 */

import { storage, STORAGE_KEYS as STORAGE_KEYS_BASE } from "./storage";
import { getBrazilDate } from "@/utils/dateUtils";
import { logAction } from "./actionLogs";
import { generateUUID } from "@/utils/uuid";
import { devError } from "@/utils/logger";

// Storage Keys - mirror storage.ts keys
export const STORAGE_KEYS = STORAGE_KEYS_BASE;

const keyToTable = (storageKey: string) => storageKey.replace("@fittrack_", "");
const shouldLog = (storageKey: string) =>
   storageKey !== STORAGE_KEYS.ACTION_LOGS;

// ============================================
// CORE OPERATIONS (mantém compatibilidade 100%)
// ============================================

// Generic query function
export async function executeQuery<T>(
   storageKey: string,
   filter?: (item: T) => boolean
): Promise<T[]> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return filter ? items.filter(filter) : items;
   } catch (error) {
      devError(`Error executing query for ${storageKey}:`, error);
      return [];
   }
}

// Generic insert function
export async function executeInsert<T>(
   storageKey: string,
   item: T
): Promise<void> {
   try {
      await storage.addItem(storageKey, item);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "insert",
            // @ts-expect-error id pode existir
            recordId: (item as any)?.id,
            payload: item,
         });
      }
   } catch (error) {
      devError(`Error inserting into ${storageKey}:`, error);
      throw error;
   }
}

// Generic update function
export async function executeUpdate<T extends { id: string }>(
   storageKey: string,
   id: string,
   updates: Partial<T>
): Promise<void> {
   try {
      await storage.updateItem(storageKey, id, updates);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "update",
            recordId: id,
            payload: updates,
         });
      }
   } catch (error) {
      devError(`Error updating ${storageKey}:`, error);
      throw error;
   }
}

// Generic delete function
export async function executeDelete<T extends { id: string }>(
   storageKey: string,
   id: string
): Promise<void> {
   try {
      await storage.deleteItem(storageKey, id);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "delete",
            recordId: id,
         });
      }
   } catch (error) {
      devError(`Error deleting from ${storageKey}:`, error);
      throw error;
   }
}

// Clear all data (for logout)
export async function clearAllData(): Promise<void> {
   try {
      await storage.clear();
   } catch (error) {
      devError("Error clearing all data:", error);
      throw error;
   }
}

// ============================================
// MEAL OPERATIONS (mantém sua interface atual)
// ============================================

export interface Meal {
   id: string;
   user_id: string;
   date: string;
   meal_name: string;
   foods: any[];
   total_calories: number;
   total_protein: number;
   total_carbs: number;
   total_fat: number;
   created_at: string;
}

export async function addMeal(
   meal: Omit<Meal, "id" | "user_id" | "date" | "created_at">
): Promise<void> {
   const newMeal: Meal = {
      id: generateUUID(),
      user_id: "local-user",
      date: getBrazilDate(),
      ...meal,
      created_at: new Date().toISOString(),
   };
   await executeInsert(STORAGE_KEYS.MEALS, newMeal);
}

// ============================================
// OPTIMIZED QUERIES (novos recursos adicionais)
// ============================================

// Query by date range
export async function executeQueryByDateRange<
   T extends { date?: string; created_at?: string }
>(storageKey: string, startDate: string, endDate: string): Promise<T[]> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return items.filter((item) => {
         const itemDate = item.date || item.created_at;
         if (!itemDate) return false;
         return itemDate >= startDate && itemDate <= endDate;
      });
   } catch (error) {
      devError(`Error querying ${storageKey} by date range:`, error);
      return [];
   }
}

// Query by user ID
export async function executeQueryByUserId<T extends { user_id?: string }>(
   storageKey: string,
   userId: string
): Promise<T[]> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return items.filter((item) => item.user_id === userId);
   } catch (error) {
      devError(`Error querying ${storageKey} by user_id:`, error);
      return [];
   }
}

// Batch insert (optimized for multiple items)
export async function executeBatchInsert<T>(
   storageKey: string,
   items: T[]
): Promise<void> {
   try {
      const existing = await storage.getItem<T>(storageKey);
      const combined = [...existing, ...items];
      await storage.setItem(storageKey, combined);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "batch_insert",
            payload: items,
         });
      }
   } catch (error) {
      devError(`Error batch inserting into ${storageKey}:`, error);
      throw error;
   }
}

// Batch update (optimized for multiple items)
export async function executeBatchUpdate<T extends { id: string }>(
   storageKey: string,
   updates: Array<{ id: string; data: Partial<T> }>
): Promise<void> {
   try {
      const items = await storage.getItem<T>(storageKey);
      const updateMap = new Map(updates.map((u) => [u.id, u.data]));

      const updated = items.map((item) => {
         const update = updateMap.get((item as any).id);
         return update ? { ...item, ...update } : item;
      });

      await storage.setItem(storageKey, updated);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "batch_update",
            payload: updates,
         });
      }
   } catch (error) {
      devError(`Error batch updating ${storageKey}:`, error);
      throw error;
   }
}

// Batch delete (optimized for multiple items)
export async function executeBatchDelete(
   storageKey: string,
   ids: string[]
): Promise<void> {
   try {
      const items = await storage.getItem(storageKey);
      const idsSet = new Set(ids);
      const filtered = items.filter((item: any) => !idsSet.has(item.id));
      await storage.setItem(storageKey, filtered);
      if (shouldLog(storageKey)) {
         await logAction({
            table: keyToTable(storageKey),
            action: "batch_delete",
            payload: ids,
         });
      }
   } catch (error) {
      devError(`Error batch deleting from ${storageKey}:`, error);
      throw error;
   }
}

// Count items matching filter
export async function executeCount<T>(
   storageKey: string,
   filter?: (item: T) => boolean
): Promise<number> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return filter ? items.filter(filter).length : items.length;
   } catch (error) {
      devError(`Error counting ${storageKey}:`, error);
      return 0;
   }
}

// Check if item exists
export async function executeExists<T extends { id: string }>(
   storageKey: string,
   id: string
): Promise<boolean> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return items.some((item) => item.id === id);
   } catch (error) {
      devError(`Error checking existence in ${storageKey}:`, error);
      return false;
   }
}

// Get single item by ID
export async function executeGetById<T extends { id: string }>(
   storageKey: string,
   id: string
): Promise<T | null> {
   try {
      const items = await storage.getItem<T>(storageKey);
      return items.find((item) => item.id === id) || null;
   } catch (error) {
      devError(`Error getting item from ${storageKey}:`, error);
      return null;
   }
}

// Clear specific storage key
export async function executeClear(storageKey: string): Promise<void> {
   try {
      await storage.setItem(storageKey, []);
   } catch (error) {
      devError(`Error clearing ${storageKey}:`, error);
      throw error;
   }
}

// Get storage statistics
export async function getStorageStats(): Promise<{
   totalKeys: number;
   totalSize: number;
   keyStats: Array<{ key: string; count: number }>;
}> {
   try {
      const allKeys = await storage.getAllKeys();
      const fittrackKeys = allKeys.filter((k) => k.startsWith("@fittrack_"));

      const keyStats = await Promise.all(
         fittrackKeys.map(async (key) => ({
            key,
            count: (await storage.getItem(key)).length,
         }))
      );

      const totalSize = await storage.getStorageSize();

      return {
         totalKeys: fittrackKeys.length,
         totalSize,
         keyStats,
      };
   } catch (error) {
      devError("Error getting storage stats:", error);
      return { totalKeys: 0, totalSize: 0, keyStats: [] };
   }
}

// Export storage for direct access
export { storage };
