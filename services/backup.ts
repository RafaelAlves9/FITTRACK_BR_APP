/**
 * Backup Service - Local JSON Backup/Restore
 * Cria backups completos do banco local em formato JSON
 * Salva em caminho padrão do dispositivo
 */

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage, STORAGE_KEYS } from "./storage";
import { devLog, devWarn, devError } from "@/utils/logger";

const BACKUP_DIR = `${FileSystem.documentDirectory}fittrack_backups/`;
const BACKUP_FILENAME_PREFIX = "fittrack_backup_";
const SAF_BACKUP_DIR_KEY = "@fittrack_backup_saf_dir"; // Android SAF persist uri

export interface BackupData {
   version: string;
   created_at: string;
   user_email: string;
   data: {
      workouts: any[];
      daily_checks: any[];
      meals: any[];
      water_intake: any[];
      measurements: any[];
      exercise_edits?: any[]; // opcional para compatibilidade retroativa
      custom_exercises?: any[]; // opcional para compatibilidade retroativa
      custom_foods?: any[]; // opcional
      recipes?: any[]; // opcional
      user_profile: any[];
      auth_users: any[];
   };
}

export interface BackupInfo {
   filename: string;
   path: string;
   created_at: string;
   size: number;
}

/**
 * Inicializa o diretório de backups
 */
async function ensureBackupDirectory(): Promise<void> {
   const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
   if (!dirInfo.exists) {
      devLog("📁 Creating backup directory:", BACKUP_DIR);
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
   }
}

/**
 * Try to save a copy of the backup into user-visible Downloads (Android only) using SAF.
 * - On first run, prompts user to choose a directory (recommend selecting "Downloads").
 * - Persists selected directory and reuses next time.
 */
async function saveCopyToDownloads(filename: string, content: string): Promise<string | null> {
   if (Platform.OS !== 'android' || !('StorageAccessFramework' in FileSystem)) {
      return null;
   }

   try {
      const saf = (FileSystem as any).StorageAccessFramework;
      // Try use stored SAF directory
      let directoryUri = await AsyncStorage.getItem(SAF_BACKUP_DIR_KEY);

      if (!directoryUri) {
         // Ask user to pick a directory (suggest selecting Downloads)
         devLog('📂 Solicitando permissão para escolher diretório (selecione Downloads)...');
         const perm = await saf.requestDirectoryPermissionsAsync();
         if (!perm.granted) {
            devWarn('⚠️ Permissão negada para escolher diretório. Pulando cópia em Downloads.');
            return null;
         }
         directoryUri = perm.directoryUri as string;
         await AsyncStorage.setItem(SAF_BACKUP_DIR_KEY, directoryUri);
      }

      // Validate access to persisted directory; if invalid, re-request permissions
      try {
         await saf.readDirectoryAsync(directoryUri);
      } catch (e) {
         devWarn('📂 Diretório SAF inválido/sem acesso. Requisitando novamente...');
         const perm = await saf.requestDirectoryPermissionsAsync();
         if (!perm.granted) return null;
         directoryUri = perm.directoryUri as string;
         await AsyncStorage.setItem(SAF_BACKUP_DIR_KEY, directoryUri);
      }

      // Create file in selected directory
      let fileUri: string;
      try {
         fileUri = await saf.createFileAsync(
            directoryUri,
            filename,
            'application/json'
         );
      } catch (e) {
         devWarn('📂 Falha ao criar arquivo no diretório atual. Requisitando novo diretório SAF...');
         const perm = await saf.requestDirectoryPermissionsAsync();
         if (!perm.granted) return null;
         directoryUri = perm.directoryUri as string;
         await AsyncStorage.setItem(SAF_BACKUP_DIR_KEY, directoryUri);
         fileUri = await saf.createFileAsync(directoryUri, filename, 'application/json');
      }

      // Write content
      await FileSystem.writeAsStringAsync(fileUri, content, {
         encoding: FileSystem.EncodingType.UTF8,
      });

      devLog('✅ Cópia salva em diretório escolhido (Downloads recomendado):', fileUri);
      return fileUri as string;
   } catch (error) {
      devWarn('⚠️ Falha ao salvar em Downloads (SAF):', (error as any)?.message || error);
      return null;
   }
}

/**
 * Limpa o diretório SAF persistido para forçar nova escolha de pasta no próximo backup
 */
export async function resetBackupDirectoryChoice(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAF_BACKUP_DIR_KEY);
  } catch {}
}

/**
 * Gera nome único para arquivo de backup
 */
function generateBackupFilename(): string {
   const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
   return `${BACKUP_FILENAME_PREFIX}${timestamp}.json`;
}

/**
 * Cria backup completo do banco de dados local
 */
export async function createBackup(userEmail: string): Promise<{
   success: boolean;
   error?: string;
   path?: string; // internal app path
   externalPath?: string; // optional SAF external path (Android)
   size?: number;
}> {
   try {
      devLog("\n========================================");
      devLog("💾 CRIANDO BACKUP LOCAL");
      devLog("========================================");
      devLog("User Email:", userEmail);
      devLog("Timestamp:", new Date().toISOString());

      if (!userEmail) {
         return {
            success: false,
            error: "Email do usuário é obrigatório",
         };
      }

      // Garantir que o diretório existe
      await ensureBackupDirectory();

      // Coletar todos os dados
      devLog("📂 Coletando dados locais...");

      const workouts = await storage.getItem(STORAGE_KEYS.WORKOUTS);
      devLog("  ✓ Workouts:", workouts.length);

      const dailyChecks = await storage.getItem(STORAGE_KEYS.DAILY_CHECKS);
      devLog("  ✓ Daily Checks:", dailyChecks.length);

      const meals = await storage.getItem(STORAGE_KEYS.MEALS);
      devLog("  ✓ Meals:", meals.length);

      const waterIntake = await storage.getItem(STORAGE_KEYS.WATER_INTAKE);
      devLog("  ✓ Water Intake:", waterIntake.length);

      const measurements = await storage.getItem(STORAGE_KEYS.MEASUREMENTS);
      devLog("  ✓ Measurements:", measurements.length);

      const exerciseEdits = await storage.getItem(STORAGE_KEYS.EXERCISE_EDITS);
      devLog("  ✓ Exercise Edits:", exerciseEdits.length);

      const customExercises = await storage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      devLog("  ✓ Custom Exercises:", customExercises.length);

      const userProfile = await storage.getItem(STORAGE_KEYS.USER_PROFILE);
      devLog("  ✓ User Profile:", userProfile.length);

      const customFoods = await storage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      devLog("  ✓ Custom Foods:", customFoods.length);

      const recipes = await storage.getItem(STORAGE_KEYS.RECIPES);
      devLog("  ✓ Recipes:", recipes.length);

      // Auth users (from AsyncStorage)
      const usersRaw = await AsyncStorage.getItem('@fittrack_users');
      const authUsers = usersRaw ? JSON.parse(usersRaw) : [];
      devLog("  ✓ Auth Users:", Array.isArray(authUsers) ? authUsers.length : 0);

      // Montar estrutura do backup
      const backupData: BackupData = {
         version: "1.0.0",
         created_at: new Date().toISOString(),
         user_email: userEmail,
         data: {
            workouts,
            daily_checks: dailyChecks,
            meals,
            water_intake: waterIntake,
            measurements,
            exercise_edits: exerciseEdits,
            custom_exercises: customExercises,
          custom_foods: customFoods,
          recipes,
            user_profile: userProfile,
            auth_users: Array.isArray(authUsers) ? authUsers : [],
         },
      };

      const totalItems =
         workouts.length +
         dailyChecks.length +
         meals.length +
         waterIntake.length +
         measurements.length +
         exerciseEdits.length +
         customExercises.length +
         customFoods.length +
         recipes.length +
         userProfile.length;

      devLog("📊 Total de itens:", totalItems);

      // Converter para JSON
      devLog("🔄 Convertendo para JSON...");
      const jsonContent = JSON.stringify(backupData, null, 2);
      const sizeInKB = (jsonContent.length / 1024).toFixed(2);
      devLog("📦 Tamanho do backup:", sizeInKB, "KB");

      // Excluir backups antigos
      devLog("🗑️ Excluindo backups antigos...");
      await deleteOldBackups();

      // Salvar arquivo no sandbox interno (sempre)
      const filename = generateBackupFilename();
      const filepath = BACKUP_DIR + filename;

      devLog("💾 Salvando arquivo:", filename);
      await FileSystem.writeAsStringAsync(filepath, jsonContent, {
         encoding: FileSystem.EncodingType.UTF8,
      });

      // Verificar se foi salvo
      const fileInfo = await FileSystem.getInfoAsync(filepath);
      if (!fileInfo.exists) {
         throw new Error("Falha ao salvar arquivo de backup");
      }

      // Opcional: salvar também em Downloads (Android) via SAF
      let externalPath: string | null = null;
      if (Platform.OS === 'android') {
         externalPath = await saveCopyToDownloads(filename, jsonContent);
      }

      devLog("========================================");
      devLog("✅ BACKUP CRIADO COM SUCESSO");
      devLog("Arquivo:", filename);
      devLog("Caminho interno:", filepath);
      if (externalPath) devLog("Caminho externo (Downloads):", externalPath);
      devLog("Tamanho:", sizeInKB, "KB");
      devLog("========================================\n");

      return {
         success: true,
         path: filepath,
         externalPath: externalPath || undefined,
         size: fileInfo.size,
      };
   } catch (error: any) {
      devLog("========================================");
      devError("❌ ERRO AO CRIAR BACKUP");
      devError("Error Type:", error.constructor.name);
      devError("Error Message:", error.message);
      devError("Error Stack:", error.stack);
      devLog("========================================\n");

      return {
         success: false,
         error: error.message || "Erro ao criar backup",
      };
   }
}

/**
 * Exclui todos os backups antigos
 */
async function deleteOldBackups(): Promise<void> {
   try {
      const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
      if (!dirInfo.exists) {
         return;
      }

      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      const backupFiles = files.filter((f) =>
         f.startsWith(BACKUP_FILENAME_PREFIX)
      );

      devLog(`  Encontrados ${backupFiles.length} backup(s) antigo(s)`);

      for (const file of backupFiles) {
         const filepath = BACKUP_DIR + file;
         devLog(`  🗑️ Excluindo: ${file}`);
         await FileSystem.deleteAsync(filepath, { idempotent: true });
      }

      devLog("  ✅ Backups antigos excluídos");
   } catch (error: any) {
      devError("  ⚠️ Erro ao excluir backups antigos:", error.message);
      // Não falhar a operação principal se não conseguir excluir antigos
   }
}

/**
 * Lista todos os backups disponíveis
 */
export async function listBackups(): Promise<BackupInfo[]> {
   try {
      await ensureBackupDirectory();

      const files = await FileSystem.readDirectoryAsync(BACKUP_DIR);
      const backupFiles = files.filter((f) =>
         f.startsWith(BACKUP_FILENAME_PREFIX)
      );

      const backupInfos: BackupInfo[] = [];

      for (const file of backupFiles) {
         const filepath = BACKUP_DIR + file;
         const fileInfo = await FileSystem.getInfoAsync(filepath);

         if (fileInfo.exists && !fileInfo.isDirectory) {
            // Extrair data do nome do arquivo
            const dateStr = file
               .replace(BACKUP_FILENAME_PREFIX, "")
               .replace(".json", "")
               .replace(/-/g, ":");

            backupInfos.push({
               filename: file,
               path: filepath,
               created_at: dateStr,
               size: fileInfo.size || 0,
            });
         }
      }

      // Ordenar do mais recente para o mais antigo
      backupInfos.sort((a, b) => b.created_at.localeCompare(a.created_at));

      return backupInfos;
   } catch (error: any) {
      devError("Error listing backups:", error);
      return [];
   }
}

/**
 * Restaura dados de um backup
 */
export async function restoreBackup(filepath: string): Promise<{
   success: boolean;
   error?: string;
   items_restored?: number;
}> {
   try {
      devLog("\n========================================");
      devLog("📥 RESTAURANDO BACKUP");
      devLog("========================================");
      devLog("File:", filepath);

      // Ler arquivo
      devLog("📂 Lendo arquivo...");
      const fileContent = await FileSystem.readAsStringAsync(filepath, {
         encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse JSON
      devLog("🔄 Parseando JSON...");
      const backupData: BackupData = JSON.parse(fileContent);

      devLog("📊 Backup Info:");
      devLog("  Version:", backupData.version);
      devLog("  Created:", backupData.created_at);
      devLog("  User:", backupData.user_email);

      // Verificar versão
      if (backupData.version !== "1.0.0") {
         throw new Error(
            `Versão de backup não suportada: ${backupData.version}`
         );
      }

      let totalRestored = 0;

      // Restaurar workouts
      devLog("📥 Restaurando workouts...");
      await storage.setItem(STORAGE_KEYS.WORKOUTS, []);
      for (const item of backupData.data.workouts) {
         await storage.addItem(STORAGE_KEYS.WORKOUTS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.workouts.length} workouts`);

      // Restaurar daily checks
      devLog("📥 Restaurando daily checks...");
      await storage.setItem(STORAGE_KEYS.DAILY_CHECKS, []);
      for (const item of backupData.data.daily_checks) {
         await storage.addItem(STORAGE_KEYS.DAILY_CHECKS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.daily_checks.length} daily checks`);

      // Restaurar meals
      devLog("📥 Restaurando meals...");
      await storage.setItem(STORAGE_KEYS.MEALS, []);
      for (const item of backupData.data.meals) {
         await storage.addItem(STORAGE_KEYS.MEALS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.meals.length} meals`);

      // Restaurar water intake
      devLog("📥 Restaurando water intake...");
      await storage.setItem(STORAGE_KEYS.WATER_INTAKE, []);
      for (const item of backupData.data.water_intake) {
         await storage.addItem(STORAGE_KEYS.WATER_INTAKE, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.water_intake.length} water intake`);

      // Restaurar measurements
      devLog("📥 Restaurando measurements...");
      await storage.setItem(STORAGE_KEYS.MEASUREMENTS, []);
      for (const item of backupData.data.measurements) {
         await storage.addItem(STORAGE_KEYS.MEASUREMENTS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.measurements.length} measurements`);

      // Restaurar exercise edits (se existir no backup)
      const editsFromBackup = Array.isArray(backupData.data.exercise_edits) ? backupData.data.exercise_edits : [];
      devLog("📥 Restaurando exercise edits...");
      await storage.setItem(STORAGE_KEYS.EXERCISE_EDITS, []);
      for (const item of editsFromBackup) {
         await storage.addItem(STORAGE_KEYS.EXERCISE_EDITS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${editsFromBackup.length} exercise edits`);

      // Restaurar custom exercises (se existir no backup)
      const customFromBackup = Array.isArray(backupData.data.custom_exercises) ? backupData.data.custom_exercises : [];
      devLog("📥 Restaurando custom exercises...");
      await storage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, []);
      for (const item of customFromBackup) {
         await storage.addItem(STORAGE_KEYS.CUSTOM_EXERCISES, item);
         totalRestored++;
      }
      devLog(`  ✅ ${customFromBackup.length} custom exercises`);

      // Restaurar custom foods (se existir)
      const customFoodsFromBackup = Array.isArray(backupData.data.custom_foods) ? backupData.data.custom_foods : [];
      devLog("📥 Restaurando custom foods...");
      await storage.setItem(STORAGE_KEYS.CUSTOM_FOODS, []);
      for (const item of customFoodsFromBackup) {
         await storage.addItem(STORAGE_KEYS.CUSTOM_FOODS, item);
         totalRestored++;
      }
      devLog(`  ✅ ${customFoodsFromBackup.length} custom foods`);

      // Restaurar recipes (se existir)
      const recipesFromBackup = Array.isArray(backupData.data.recipes) ? backupData.data.recipes : [];
      devLog("📥 Restaurando recipes...");
      await storage.setItem(STORAGE_KEYS.RECIPES, []);
      for (const item of recipesFromBackup) {
         await storage.addItem(STORAGE_KEYS.RECIPES, item);
         totalRestored++;
      }
      devLog(`  ✅ ${recipesFromBackup.length} recipes`);

      // Restaurar user profile
      devLog("📥 Restaurando user profile...");
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, []);
      for (const item of backupData.data.user_profile) {
         await storage.addItem(STORAGE_KEYS.USER_PROFILE, item);
         totalRestored++;
      }
      devLog(`  ✅ ${backupData.data.user_profile.length} user profile`);

      // Restaurar auth users (AsyncStorage)
      if (Array.isArray(backupData.data.auth_users)) {
         devLog("📥 Restaurando auth users...");
         await AsyncStorage.setItem('@fittrack_users', JSON.stringify(backupData.data.auth_users));
         totalRestored += backupData.data.auth_users.length;
         devLog(`  ✅ ${backupData.data.auth_users.length} users`);
      }

      devLog("========================================");
      devLog("✅ BACKUP RESTAURADO COM SUCESSO");
      devLog("Total de itens:", totalRestored);
      devLog("========================================\n");

      return {
         success: true,
         items_restored: totalRestored,
      };
   } catch (error: any) {
      devLog("========================================");
      devError("❌ ERRO AO RESTAURAR BACKUP");
      devError("Error Type:", error.constructor.name);
      devError("Error Message:", error.message);
      devError("Error Stack:", error.stack);
      devLog("========================================\n");

      return {
         success: false,
         error: error.message || "Erro ao restaurar backup",
      };
   }
}

/**
 * Compartilha o último backup criado
 */
export async function shareLastBackup(): Promise<{
   success: boolean;
   error?: string;
}> {
   try {
      const backups = await listBackups();

      if (backups.length === 0) {
         return {
            success: false,
            error: "Nenhum backup encontrado",
         };
      }

      const lastBackup = backups[0];

      // Verificar se compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
         return {
            success: false,
            error: "Compartilhamento não disponível neste dispositivo",
         };
      }

      devLog("📤 Compartilhando backup:", lastBackup.filename);
      await Sharing.shareAsync(lastBackup.path, {
         mimeType: "application/json",
         dialogTitle: "Compartilhar Backup FitTrack",
         UTI: "public.json",
      });

      return { success: true };
   } catch (error: any) {
      devError("Error sharing backup:", error);
      return {
         success: false,
         error: error.message || "Erro ao compartilhar backup",
      };
   }
}

/**
 * Importa backup de arquivo selecionado pelo usuário
 */
export async function importBackupFromFile(): Promise<{
   success: boolean;
   error?: string;
   items_restored?: number;
}> {
   try {
      devLog("📂 Abrindo seletor de arquivo...");

      const result = await DocumentPicker.getDocumentAsync({
         type: "application/json",
         copyToCacheDirectory: true,
      });

      if (result.canceled) {
         return {
            success: false,
            error: "Seleção cancelada",
         };
      }

      if (!result.assets || result.assets.length === 0) {
         return {
            success: false,
            error: "Nenhum arquivo selecionado",
         };
      }

      const file = result.assets[0];
      devLog("📄 Arquivo selecionado:", file.name);

      // Restaurar do arquivo selecionado
      return await restoreBackup(file.uri);
   } catch (error: any) {
      devError("Error importing backup:", error);
      return {
         success: false,
         error: error.message || "Erro ao importar backup",
      };
   }
}

/**
 * Obtém informações sobre o último backup
 */
export async function getLastBackupInfo(): Promise<BackupInfo | null> {
   const backups = await listBackups();
   return backups.length > 0 ? backups[0] : null;
}
