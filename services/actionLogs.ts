/**
 * Action Logs Service
 * Registra operações de escrita para futura sincronização com backend.
 */

import { storage, STORAGE_KEYS } from './storage';
import { generateUUID } from '@/utils/uuid';

export type ActionType = 'insert' | 'update' | 'delete' | 'batch_insert' | 'batch_update' | 'batch_delete' | 'upsert';

export interface ActionLog {
  id: string;
  user_id?: string;
  table_name: string;          // Nome da tabela (ex: workouts)
  action: ActionType;          // insert/update/delete/...
  record_id?: string;          // UUID do registro afetado (quando aplicável)
  payload?: any;               // Snapshot/diff opcional
  created_at: string;          // ISO string
  synced: number;              // 0/1 para futura sincronização
}

// Evita logar a própria tabela de logs
const shouldSkipLog = (table: string) => table === 'action_logs';

export const logAction = async (params: {
  table: string;
  action: ActionType;
  recordId?: string;
  payload?: any;
  userId?: string;
}) => {
  const { table, action, recordId, payload, userId } = params;

  if (shouldSkipLog(table)) return;

  const log: ActionLog = {
    id: generateUUID(),
    user_id: userId,
    table_name: table,
    action,
    record_id: recordId,
    payload,
    created_at: new Date().toISOString(),
    synced: 0,
  };

  await storage.addItem<ActionLog>(STORAGE_KEYS.ACTION_LOGS, log);
};

