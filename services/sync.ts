import { api, AUTH_TOKEN_KEY } from './api';
import { storage, STORAGE_KEYS } from './storage';
import { ActionLog } from './actionLogs';
import { generateUUID } from '@/utils/uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog, devWarn, devError } from '@/utils/logger';

// Interface do Payload de Pull (Snake Case conforme documentação)
interface PullResponse {
  workouts: any[];
  daily_checks: any[];
  meals: any[];
  water_intakes: any[];
  measurements: any[];
  custom_exercises: any[];
  exercise_edits: any[];
  user_profile: any;
  custom_foods: any[];
  recipes: any[];
  nutrition_goals: any[];
  workout_sessions: any[];
  workout_favorites: any[];
  workout_history: any[];
  // Novas tabelas
  exercises: any[];
  workout_exercises: any[];
  exercise_values: any[];
}

// Mapeamento Chave API (Snake) -> Chave Storage (Snake)
const WORKOUT_HISTORY_KEY = (STORAGE_KEYS as any).WORKOUT_HISTORY || '@fittrack_workout_history';

const API_TO_STORAGE_MAP: Record<keyof PullResponse, string> = {
  workouts: STORAGE_KEYS.WORKOUTS,
  daily_checks: STORAGE_KEYS.DAILY_CHECKS,
  meals: STORAGE_KEYS.MEALS,
  water_intakes: STORAGE_KEYS.WATER_INTAKE,
  measurements: STORAGE_KEYS.MEASUREMENTS,
  custom_exercises: STORAGE_KEYS.CUSTOM_EXERCISES,
  exercise_edits: STORAGE_KEYS.EXERCISE_EDITS,
  user_profile: STORAGE_KEYS.USER_PROFILE,
  custom_foods: STORAGE_KEYS.CUSTOM_FOODS,
  recipes: STORAGE_KEYS.RECIPES,
  nutrition_goals: STORAGE_KEYS.NUTRITION_GOALS,
  workout_sessions: STORAGE_KEYS.WORKOUT_SESSIONS,
  workout_favorites: STORAGE_KEYS.WORKOUT_FAVORITES,
  workout_history: WORKOUT_HISTORY_KEY,
  // Novas tabelas
  exercises: STORAGE_KEYS.EXERCISES,
  workout_exercises: STORAGE_KEYS.WORKOUT_EXERCISES,
  exercise_values: STORAGE_KEYS.EXERCISE_VALUES,
};

// Transformers: Ajustes de tipo apenas (Backend já manda Snake Case)
const transformers: Partial<Record<keyof PullResponse, (item: any) => any>> = {
  workouts: (item: any) => ({
    ...item,
    // exercises não existe mais no schema local como JSON, mas o backend pode mandar. Ignoramos ou salvamos se ainda for compatível.
    // exercises: typeof item.exercises === 'string' ? item.exercises : JSON.stringify(item.exercises || []),
    times_done: item.times_done || 0,
    synced: 1, 
    last_synced_at: new Date().toISOString()
  }),
  exercises: (item: any) => ({
      ...item,
      target_muscles: typeof item.target_muscles === 'object' ? JSON.stringify(item.target_muscles) : item.target_muscles,
  }),
  workout_exercises: (item: any) => ({
      ...item,
      synced: 1,
      last_synced_at: new Date().toISOString()
  }),
  exercise_values: (item: any) => ({
      ...item,
      synced: 1,
      last_synced_at: new Date().toISOString()
  }),
  daily_checks: (item: any) => ({
    ...item,
    // Ensure date is YYYY-MM-DD
    date: item.date && typeof item.date === 'string' ? item.date.split('T')[0] : item.date,
    // More robust completed check (handles "true" string, boolean, 1)
    completed: String(item.completed) === 'true' || item.completed === true || item.completed === 1 ? 1 : 0,
    synced: 1,
    last_synced_at: new Date().toISOString()
  }),
  meals: (item: any) => ({
    ...item,
    foods: typeof item.foods === 'string' ? item.foods : JSON.stringify(item.foods || []),
    synced: 1,
    last_synced_at: new Date().toISOString()
  }),
  recipes: (item: any) => ({
    ...item,
    foods: typeof item.foods === 'string' ? item.foods : JSON.stringify(item.foods || []),
  }),
  custom_foods: (item: any) => ({
    ...item,
    serving: typeof item.serving === 'string' ? item.serving : JSON.stringify(item.serving || {}),
    nutrition: typeof item.nutrition === 'string' ? item.nutrition : JSON.stringify(item.nutrition || {}),
  }),
  user_profile: (item: any) => ({
    ...item,
    onboarding_completed: item.onboarding_completed === true || item.onboarding_completed === 1 ? 1 : 0,
    auth_id: item.auth_id
  }),
};

// Helper: Snake -> PascalCase (com singularização simples)
const toEntityName = (tableName: string) => {
  // Ajuste específico para casos especiais que não seguem a regra padrão
  if (tableName === 'water_intake') return 'WaterIntake';
  if (tableName === 'user_profile') return 'UserProfile';
  
  const pascal = tableName.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  if (pascal.endsWith('s') && pascal !== 'NutritionGoals') {
      return pascal.slice(0, -1);
  }
  return pascal;
};

const ACTION_MAP: Record<string, string> = {
  insert: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE',
  upsert: 'UPDATE',
  batch_insert: 'CREATE',
  batch_update: 'UPDATE',
  batch_delete: 'DELETE'
};

// Helper: Limpa campo foods do payload (sempre envia array vazio)
const cleanPayload = (payload: any): any => {
  if (!payload || typeof payload !== 'object') return payload;
  
  const cleaned = { ...payload };
  
  // Se tiver campo foods, substitui por array vazio
  if ('foods' in cleaned) {
    cleaned.foods = "";
  }
  
  return cleaned;
};

/**
 * PULL SYNC: Sobrescreve dados locais com dados do servidor
 */
export async function syncPullData(): Promise<void> {
  devLog('[Sync] Starting Pull...');
  
  // Verifica token de autenticação antes da requisição
  const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    devLog('[Sync] ✅ Token de autenticação encontrado. Será enviado no header Authorization.');
    devLog('[Sync] Token (primeiros 20 chars):', token.substring(0, 20) + '...');
  } else {
    devWarn('[Sync] ⚠️ Token de autenticação NÃO encontrado. Requisição pode falhar por falta de autenticação.');
  }
  
  try {
    devLog('[Sync] Fazendo requisição GET para /sync/pull...');
    const data = await api.get<PullResponse>('/sync/pull');
    devLog('[Sync] ✅ Requisição Pull concluída com sucesso.');

    const promises = Object.entries(API_TO_STORAGE_MAP).map(async ([apiKey, storageKey]) => {
      const items = data[apiKey as keyof PullResponse];
      const transformer = transformers[apiKey as keyof PullResponse];
      
      if (!items) return; 

      if (apiKey === 'daily_checks' && Array.isArray(items)) {
         devLog(`[Sync] Received ${items.length} daily_checks from backend.`);
         if (items.length > 0) {
            devLog('[Sync] Sample daily_check raw:', JSON.stringify(items[0]));
         }
      }

      if (Array.isArray(items)) {
        const cleanItems = items
            .filter(i => i !== null)
            .map(i => transformer ? transformer(i) : { ...i, synced: 1, last_synced_at: new Date().toISOString() });
            
        await storage.setItem(storageKey, cleanItems);
      } else if (typeof items === 'object' && items !== null) {
        const transformed = transformer ? transformer(items) : items;
        await storage.setItem(storageKey, [transformed]);
      }
    });

    await Promise.all(promises);
    
    await logSyncRun('pull', 'success');
    devLog('[Sync] Pull completed successfully.');

  } catch (error) {
    devError('[Sync] Pull failed:', error);
    await logSyncRun('pull', 'error', JSON.stringify(error));
    throw error;
  }
}

/**
 * PUSH SYNC: Envia logs de ações locais para o servidor
 */
export async function syncPushData(force: boolean = false): Promise<void> {
  try {
    if (!force && !(await shouldRunPushSync())) {
        return;
    }

    devLog('[Sync] Starting Push...');
    
    // Verifica token de autenticação antes da requisição
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      devLog('[Sync] ✅ Token de autenticação encontrado. Será enviado no header Authorization.');
      devLog('[Sync] Token (primeiros 20 chars):', token.substring(0, 20) + '...');
    } else {
      devWarn('[Sync] ⚠️ Token de autenticação NÃO encontrado. Requisição pode falhar por falta de autenticação.');
    }
    
    const logs = await storage.getItem<ActionLog>(STORAGE_KEYS.ACTION_LOGS);
    
    const validLogs = logs.filter(l => l && l.id && l.table_name && l.action);

    if (validLogs.length === 0) return;

    // Helper para obter o ID do usuário atual (do AsyncStorage)
    const getCurrentUserId = async (): Promise<string | null> => {
      try {
        const userData = await AsyncStorage.getItem('@fittrack_user_data');
        if (userData) {
          const user = JSON.parse(userData);
          return user.id || null;
        }
        return null;
      } catch {
        return null;
      }
    };

    const currentUserId = await getCurrentUserId();
    if (!currentUserId && validLogs.length > 0) {
      devWarn('[Sync] ⚠️ ID do usuário não encontrado. Alguns logs podem ser enviados sem user_id.');
    }

    // Transformação para formato do Backend
    const transformedLogs = validLogs.map(log => {
      let payloadObj = log.payload;
      if (typeof payloadObj === 'string') {
        try { payloadObj = JSON.parse(payloadObj); } catch {}
      }
      devLog('payloadObj', payloadObj);
      
      // Limpa o payload (remove foods, substitui por array vazio)
      const cleanedPayload = cleanPayload(payloadObj || {});
      
      // Injeta user_id no payload se não existir e tivermos o ID do usuário
      if (cleanedPayload && typeof cleanedPayload === 'object' && !cleanedPayload.user_id && currentUserId) {
        cleanedPayload.user_id = currentUserId;
      }

      return {
        id: log.id,
        table_name: log.table_name,
        action: ACTION_MAP[log.action] || 'CREATE',
        record_id: log.record_id,
        payload: cleanedPayload,
        created_at: new Date(log.created_at).toISOString() // Força string ISO válida no root do log
      };
    });

    const payload = { logs: transformedLogs };
    devLog('[Sync] Push Payload (First 2):', JSON.stringify(transformedLogs.slice(0, 2), null, 2));
    devLog('[Sync] Fazendo requisição POST para /sync/push com', transformedLogs.length, 'logs...');
    
    await api.post('/sync/push', payload);
    devLog('[Sync] ✅ Requisição Push concluída com sucesso.');

    for (const log of validLogs) {
      await storage.deleteItem(STORAGE_KEYS.ACTION_LOGS, log.id);
    }

    await logSyncRun('push', 'success', undefined, validLogs.length);
    devLog(`[Sync] Push completed. Sent ${validLogs.length} logs.`);

  } catch (error: any) {
    devError('[Sync] Push failed:', error);
    await logSyncRun('push', 'error', error.message || 'Unknown error');
  }
}

/**
 * Helper: Verifica se deve rodar Push Sync
 */
async function shouldRunPushSync(): Promise<boolean> {
  try {
    const logs = await storage.getItem<ActionLog>(STORAGE_KEYS.ACTION_LOGS);
    const pendingCount = logs ? logs.length : 0;

    if (pendingCount > 5) {
        return true;
    }

    const lastSyncTime = await getLastSyncTime();
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const timeDiff = Date.now() - lastSyncTime;

    if (timeDiff > sixHoursMs && pendingCount > 0) {
        return true;
    }

    return false;
  } catch (e) {
    devWarn('[Sync] Check failed, skipping push.', e);
    return false;
  }
}

async function getLastSyncTime(): Promise<number> {
  try {
    const runs = await storage.getItem<any>(STORAGE_KEYS.LOG_SYNC_RUNS);
    if (!runs || runs.length === 0) return 0;
    
    const successfulRuns = runs
        .filter((r: any) => r.status === 'success')
        .sort((a: any, b: any) => new Date(b.finished_at).getTime() - new Date(a.finished_at).getTime());

    return successfulRuns[0] ? new Date(successfulRuns[0].finished_at).getTime() : 0;
  } catch {
    return 0;
  }
}

async function logSyncRun(type: 'pull' | 'push', status: 'success' | 'error', errorMessage?: string, count: number = 0) {
  try {
    const log = {
        id: generateUUID(),
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        type,
        status,
        error_message: errorMessage,
        items_count: count
    };
    await storage.addItem(STORAGE_KEYS.LOG_SYNC_RUNS, log);
  } catch (e) {
      devWarn('Failed to save sync log', e);
  }
}
