/**
 * Storage Abstraction Layer - SQLite Only
 * Unified storage for all platforms using expo-sqlite
 */

import * as SQLite from "expo-sqlite";
import { AppState } from "react-native";
import { devLog, devWarn, devError } from "@/utils/logger";

export const STORAGE_KEYS = {
   WORKOUTS: "@fittrack_workouts",
   DAILY_CHECKS: "@fittrack_daily_checks",
   MEALS: "@fittrack_meals",
   WATER_INTAKE: "@fittrack_water_intake",
   MEASUREMENTS: "@fittrack_measurements",
   EXERCISE_EDITS: "@fittrack_exercise_edits",
   CUSTOM_EXERCISES: "@fittrack_custom_exercises",
   SYNC_STATUS: "@fittrack_sync_status",
   CUSTOM_FOODS: "@fittrack_custom_foods",
   RECIPES: "@fittrack_recipes",
   USER_PROFILE: "@fittrack_user_profile",
   NUTRITION_GOALS: "@fittrack_nutrition_goals",
   WORKOUT_SESSIONS: "@fittrack_workout_sessions",
   WORKOUT_FAVORITES: "@fittrack_workout_favorites",
   WORKOUT_EXERCISES: "@fittrack_workout_exercises",
   EXERCISE_VALUES: "@fittrack_exercise_values",
   EXERCISES: "@fittrack_exercises",
   ACTION_LOGS: "@fittrack_action_logs",
   LOG_SYNC_RUNS: "@fittrack_log_sync_runs",
} as const;

// Generic storage interface
interface StorageAdapter {
   getItem<T>(key: string): Promise<T[]>;
   setItem<T>(key: string, data: T[]): Promise<void>;
   addItem<T>(key: string, item: T): Promise<void>;
   updateItem<T>(key: string, id: string, updates: Partial<T>): Promise<void>;
   deleteItem(key: string, id: string): Promise<void>;
   clear(): Promise<void>;
}

// SQLite implementation
class SQLiteStorageAdapter implements StorageAdapter {
   private db: SQLite.SQLiteDatabase | null = null;
   private initPromise: Promise<void> | null = null;
   private isInitialized = false;
   // Serializa todas as escritas para evitar database lock
   private writeChain: Promise<void> = Promise.resolve();

   constructor() {
      this.initPromise = this.initialize();
      this.setupAppStateListener();
   }

   private setupAppStateListener() {
      let appState = AppState.currentState;
      AppState.addEventListener("change", async (nextAppState) => {
         if (
            appState.match(/inactive|background/) &&
            nextAppState === "active"
         ) {
            devLog("[SQLiteStorage] App resumed, ensuring DB is alive...");
            await this.ensureInitialized();
         }
         appState = nextAppState;
      });
   }

   private async initialize(): Promise<void> {
      try {
         devLog("[SQLiteStorage] Initializing database...");
         this.db = await SQLite.openDatabaseAsync("fittrack.db");
         await this.createTables();
         this.isInitialized = true;
         devLog("[SQLiteStorage] Database initialized successfully");
      } catch (error) {
         devError("[SQLiteStorage] Failed to initialize:", error);
         this.isInitialized = false;
         throw error;
      }
   }

   private async ensureInitialized(): Promise<void> {
      if (this.isInitialized && this.db) {
         try {
            // Test connection with lightweight query
            await this.db.getFirstAsync("PRAGMA user_version");
            return;
         } catch (error) {
            devWarn("[SQLiteStorage] Connection lost, reinitializing...");
            this.isInitialized = false;
         }
      }

      if (this.initPromise) {
         await this.initPromise;
      } else {
         this.initPromise = this.initialize();
         await this.initPromise;
      }
   }

   private async withRetry<T>(
      operation: () => Promise<T>,
      retries = 2
   ): Promise<T> {
      for (let attempt = 0; attempt <= retries; attempt++) {
         try {
            await this.ensureInitialized();
            return await operation();
         } catch (error: any) {
            const isRecoverable =
               error?.message?.includes("database") ||
               error?.message?.includes("connection") ||
               error?.message?.includes("prepareAsync") ||
               error?.message?.includes("NullPointerException") ||
               error?.code === "ERR_UNEXPECTED";

            if (isRecoverable && attempt < retries) {
               devWarn(
                  `[SQLiteStorage] Retry ${
                     attempt + 1
                  }/${retries} after error:`,
                  error?.message
               );
               await new Promise((resolve) =>
                  setTimeout(resolve, 100 * (attempt + 1))
               );
               this.isInitialized = false; // Force reinit
               continue;
            }
            throw error;
         }
      }
      throw new Error("Retry exhausted");
   }

   private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
      const run = this.writeChain.then(fn, fn);
      // Atualiza a cadeia, ignorando resultado/erros (para não quebrar a fila)
      this.writeChain = run.then(
         () => undefined,
         () => undefined
      );
      return run;
   }

   private async createTables() {
      await this.db!.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      PRAGMA foreign_keys = ON;
      PRAGMA temp_store = MEMORY;
      PRAGMA synchronous = NORMAL;
      
      CREATE TABLE IF NOT EXISTS workouts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        exercises TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_done TEXT,
        times_done INTEGER NOT NULL DEFAULT 0,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS daily_checks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        workout_id TEXT,
        completed INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT,
        UNIQUE(user_id, date, workout_id)
      );
      
      CREATE TABLE IF NOT EXISTS meals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        meal_name TEXT NOT NULL,
        foods TEXT NOT NULL,
        total_calories REAL NOT NULL DEFAULT 0,
        total_protein REAL NOT NULL DEFAULT 0,
        total_carbs REAL NOT NULL DEFAULT 0,
        total_fat REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );
      
      CREATE TABLE IF NOT EXISTS water_intake (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        amount_ml INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT,
        UNIQUE(user_id, date)
      );
      
      CREATE TABLE IF NOT EXISTS measurements (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS custom_exercises (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        calories_per_hour REAL,
        calories_per_12_reps REAL,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS exercise_edits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        exercise_type TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        weight REAL,
        sets INTEGER,
        reps INTEGER,
        duration INTEGER,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        username TEXT,
        phone TEXT,
        avatar_uri TEXT,
        gender TEXT,
        age INTEGER,
        onboarding_completed INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL,
        auth_id TEXT
      );

      CREATE TABLE IF NOT EXISTS custom_foods (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT,
        serving TEXT,
        nutrition TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        name TEXT NOT NULL,
        foods TEXT NOT NULL,
        total_calories REAL NOT NULL DEFAULT 0,
        total_protein REAL NOT NULL DEFAULT 0,
        total_carbs REAL NOT NULL DEFAULT 0,
        total_fat REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        times_used INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        gif_url TEXT,
        image_url TEXT,
        target_muscles TEXT,
        calories_per_hour REAL,
        calories_per_12_reps REAL,
        default_sets INTEGER,
        default_reps INTEGER,
        default_weight REAL,
        default_duration INTEGER,
        created_at TEXT,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS nutrition_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        daily_calories REAL NOT NULL,
        protein_g REAL NOT NULL,
        carbs_g REAL NOT NULL,
        fat_g REAL NOT NULL,
        water_ml REAL,
        updated_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        workout_name TEXT NOT NULL,
        started_at TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        exercises_completed INTEGER NOT NULL,
        total_exercises INTEGER NOT NULL,
        calories_burned REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        workout_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(user_id, workout_id)
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT,
        FOREIGN KEY(workout_id) REFERENCES workouts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS exercise_values (
        id TEXT PRIMARY KEY,
        exercise_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        weight REAL,
        sets INTEGER,
        reps INTEGER,
        duration INTEGER,
        distance REAL,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0,
        last_synced_at TEXT
      );

      CREATE TABLE IF NOT EXISTS action_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        table_name TEXT NOT NULL,
        action TEXT NOT NULL,
        record_id TEXT,
        payload TEXT,
        created_at TEXT NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS log_sync_runs (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        logs_sent INTEGER NOT NULL DEFAULT 0,
        logs_received INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        last_sync_at TEXT
      );

      CREATE TABLE IF NOT EXISTS workout_history (
        id TEXT PRIMARY KEY,
        workout_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        date TEXT NOT NULL,
        weight REAL,
        sets INTEGER,
        reps INTEGER
      );
      
      CREATE TABLE IF NOT EXISTS sync_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        last_sync_at TEXT,
        total_synced INTEGER NOT NULL DEFAULT 0,
        total_pending INTEGER NOT NULL DEFAULT 0
      );

      -- Índices otimizados
      CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
      CREATE INDEX IF NOT EXISTS idx_workouts_synced ON workouts(synced);
      CREATE INDEX IF NOT EXISTS idx_daily_checks_user_date ON daily_checks(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_daily_checks_synced ON daily_checks(synced);
      CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_meals_synced ON meals(synced);
      CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_measurements_user_date ON measurements(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_exercise_edits_user_date ON exercise_edits(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_exercise_edits_exercise_id ON exercise_edits(exercise_id);
      CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON custom_exercises(user_id);
      CREATE INDEX IF NOT EXISTS idx_custom_foods_user_email ON custom_foods(user_email);
      CREATE INDEX IF NOT EXISTS idx_recipes_user_email ON recipes(user_email);
      CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(type);
      CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
      CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
      CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
      CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(exercise_id);
      CREATE INDEX IF NOT EXISTS idx_exercise_values_exercise ON exercise_values(exercise_id);
      CREATE INDEX IF NOT EXISTS idx_exercise_values_user_date ON exercise_values(user_id, date);
    `);

      // Migração de colunas antigas (se necessário)
      await this.migrateColumns();
      // Migração de dados de arquitetura (JSON -> Relacional)
      await this.migrateWorkoutArchitecture();
   }

   private async migrateColumns() {
      try {
         const tables = [
            "workouts",
            "daily_checks",
            "meals",
            "water_intake",
            "measurements",
            "custom_exercises",
            "exercise_edits",
            "nutrition_goals",
            "exercises",
         ];

         for (const table of tables) {
            const cols: any[] = await this.db!.getAllAsync(
               `PRAGMA table_info(${table})`
            );
            const names = new Set((cols || []).map((c: any) => c.name));

            if (!names.has("last_synced_at")) {
               await this.db!.execAsync(
                  `ALTER TABLE ${table} ADD COLUMN last_synced_at TEXT`
               );
               devLog(`[SQLiteStorage] Added last_synced_at to ${table}`);
            }
            
            // Add user_id to exercises if missing
            if (table === "exercises") {
               if (!names.has("user_id")) {
                  await this.db!.execAsync(
                     `ALTER TABLE exercises ADD COLUMN user_id TEXT`
                  );
                  devLog(`[SQLiteStorage] Added user_id to exercises`);
               }
               if (!names.has("created_at")) {
                  await this.db!.execAsync(
                     `ALTER TABLE exercises ADD COLUMN created_at TEXT`
                  );
                  devLog(`[SQLiteStorage] Added created_at to exercises`);
               }
            }
         }

         // Migração para workouts (custom fields)
         const workoutCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(workouts)"
         );
         const workoutNames = new Set((workoutCols || []).map((c: any) => c.name));
         
         if (!workoutNames.has("total_exercises")) {
            await this.db!.execAsync(
               "ALTER TABLE workouts ADD COLUMN total_exercises INTEGER DEFAULT 0"
            );
            devLog("[SQLiteStorage] Added total_exercises to workouts");
         }
         
         if (!workoutNames.has("estimated_calories")) {
            await this.db!.execAsync(
               "ALTER TABLE workouts ADD COLUMN estimated_calories REAL DEFAULT 0"
            );
            devLog("[SQLiteStorage] Added estimated_calories to workouts");
         }

         // Migração para exercise_edits (distance)
         const exerciseEditsCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(exercise_edits)"
         );
         const exerciseEditsNames = new Set((exerciseEditsCols || []).map((c: any) => c.name));

         if (!exerciseEditsNames.has("distance")) {
            await this.db!.execAsync(
               "ALTER TABLE exercise_edits ADD COLUMN distance REAL"
            );
            devLog("[SQLiteStorage] Added distance to exercise_edits");
         }

         // Migração para nutrition_goals (water_ml)
         const nutritionCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(nutrition_goals)"
         );
         const nutritionNames = new Set((nutritionCols || []).map((c: any) => c.name));
         if (!nutritionNames.has("water_ml")) {
            await this.db!.execAsync(
               "ALTER TABLE nutrition_goals ADD COLUMN water_ml REAL"
            );
            devLog("[SQLiteStorage] Added water_ml to nutrition_goals");
         }

         // Migração para user_profile (gender, age, onboarding_completed)
         const profileCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(user_profile)"
         );
         const profileNames = new Set((profileCols || []).map((c: any) => c.name));
         if (!profileNames.has("gender")) {
            await this.db!.execAsync(
               "ALTER TABLE user_profile ADD COLUMN gender TEXT"
            );
            devLog("[SQLiteStorage] Added gender to user_profile");
         }
         if (!profileNames.has("age")) {
            await this.db!.execAsync(
               "ALTER TABLE user_profile ADD COLUMN age INTEGER"
            );
            devLog("[SQLiteStorage] Added age to user_profile");
         }
         if (!profileNames.has("onboarding_completed")) {
            await this.db!.execAsync(
               "ALTER TABLE user_profile ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0"
            );
            devLog("[SQLiteStorage] Added onboarding_completed to user_profile");
         }
         
         if (!profileNames.has("auth_id")) {
            await this.db!.execAsync(
               "ALTER TABLE user_profile ADD COLUMN auth_id TEXT"
            );
            devLog("[SQLiteStorage] Added auth_id to user_profile");
         }

         // Migração específica para sync_status
         const syncCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(sync_status)"
         );
         const syncNames = new Set((syncCols || []).map((c: any) => c.name));

         if (!syncNames.has("last_sync_at")) {
            await this.db!.execAsync(
               "ALTER TABLE sync_status ADD COLUMN last_sync_at TEXT"
            );
         }
         if (!syncNames.has("total_synced")) {
            await this.db!.execAsync(
               "ALTER TABLE sync_status ADD COLUMN total_synced INTEGER NOT NULL DEFAULT 0"
            );
         }
         if (!syncNames.has("total_pending")) {
            await this.db!.execAsync(
               "ALTER TABLE sync_status ADD COLUMN total_pending INTEGER NOT NULL DEFAULT 0"
            );
         }

         // Migração para custom_exercises (camelCase para snake_case)
         const customExCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(custom_exercises)"
         );
         const customExNames = new Set((customExCols || []).map((c: any) => c.name));
         if (customExNames.has("caloriesPerHour") && !customExNames.has("calories_per_hour")) {
             devLog("[SQLiteStorage] Migrating custom_exercises columns...");
             await this.db!.execAsync("ALTER TABLE custom_exercises ADD COLUMN calories_per_hour REAL");
             await this.db!.execAsync("UPDATE custom_exercises SET calories_per_hour = caloriesPerHour");
             // Nota: SQLite não suporta DROP COLUMN facilmente em versões antigas, 
             // mas podemos deixar a coluna antiga orfã por enquanto ou recriar a tabela.
             // Para simplificar, vamos apenas adicionar a nova e usar ela.
         }
         if (customExNames.has("caloriesPer12Reps") && !customExNames.has("calories_per_12_reps")) {
             await this.db!.execAsync("ALTER TABLE custom_exercises ADD COLUMN calories_per_12_reps REAL");
             await this.db!.execAsync("UPDATE custom_exercises SET calories_per_12_reps = caloriesPer12Reps");
         }
         const logRunCols: any[] = await this.db!.getAllAsync(
            "PRAGMA table_info(log_sync_runs)"
         );
         const logRunNames = new Set((logRunCols || []).map((c: any) => c.name));
         
         if (!logRunNames.has("type")) {
            await this.db!.execAsync(
               "ALTER TABLE log_sync_runs ADD COLUMN type TEXT"
            );
         }
         if (!logRunNames.has("items_count")) {
            await this.db!.execAsync(
               "ALTER TABLE log_sync_runs ADD COLUMN items_count INTEGER DEFAULT 0"
            );
         }

         // Migração da constraint de daily_checks
         await this.migrateDailyChecksConstraint();

      } catch (error) {
         devWarn("[SQLiteStorage] Migration warning:", error);
      }
   }

   private async migrateDailyChecksConstraint() {
      try {
         const result = await this.db!.getFirstAsync<{ sql: string }>(
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_checks'"
         );

         if (result && result.sql.includes("UNIQUE(user_id, date)")) {
            devLog("[SQLiteStorage] Migrating daily_checks constraint...");
            
            await this.db!.execAsync("BEGIN IMMEDIATE");
            try {
               // 1. Rename old table
               await this.db!.execAsync("ALTER TABLE daily_checks RENAME TO daily_checks_old");

               // 2. Create new table with correct constraint
               await this.db!.execAsync(`
                  CREATE TABLE daily_checks (
                     id TEXT PRIMARY KEY,
                     user_id TEXT NOT NULL,
                     date TEXT NOT NULL,
                     workout_id TEXT,
                     completed INTEGER NOT NULL DEFAULT 1,
                     created_at TEXT NOT NULL,
                     synced INTEGER NOT NULL DEFAULT 0,
                     last_synced_at TEXT,
                     UNIQUE(user_id, date, workout_id)
                  )
               `);

               // 3. Copy data
               await this.db!.execAsync(`
                  INSERT INTO daily_checks (id, user_id, date, workout_id, completed, created_at, synced, last_synced_at)
                  SELECT id, user_id, date, workout_id, completed, created_at, synced, last_synced_at 
                  FROM daily_checks_old
               `);

               // 4. Drop old table
               await this.db!.execAsync("DROP TABLE daily_checks_old");
               
               // 5. Recreate index
               await this.db!.execAsync("CREATE INDEX IF NOT EXISTS idx_daily_checks_user_date ON daily_checks(user_id, date)");
               await this.db!.execAsync("CREATE INDEX IF NOT EXISTS idx_daily_checks_synced ON daily_checks(synced)");

               await this.db!.execAsync("COMMIT");
               devLog("[SQLiteStorage] daily_checks migration completed successfully");
            } catch (error) {
               await this.db!.execAsync("ROLLBACK");
               devError("[SQLiteStorage] Failed to migrate daily_checks:", error);
               // If failed, try to restore? Or just let it fail and retry next time?
               // If rename happened but create failed, we are in trouble. 
               // But transaction should handle it.
               throw error;
            }
         }
      } catch (error) {
         devError("[SQLiteStorage] Error checking daily_checks constraint:", error);
      }
   }

   private async migrateWorkoutArchitecture() {
      try {
         // 1. Migrar exercícios de JSON em workouts para workout_exercises
         const hasWorkoutExercises = await this.db!.getFirstAsync(
            "SELECT count(*) as count FROM workout_exercises"
         );
         
         if ((hasWorkoutExercises as any).count === 0) {
             devLog("[SQLiteStorage] Migrating workouts JSON to workout_exercises...");
             const workouts = await this.db!.getAllAsync<any>("SELECT * FROM workouts");
             
             for (const w of workouts) {
                 if (w.exercises) {
                     let exercisesList: any[] = [];
                     try {
                         exercisesList = JSON.parse(w.exercises);
                     } catch (e) {
                         devWarn(`[SQLiteStorage] Failed to parse exercises for workout ${w.id}`);
                         continue;
                     }

                     if (Array.isArray(exercisesList)) {
                         for (let i = 0; i < exercisesList.length; i++) {
                             const ex = exercisesList[i];
                             const relationId = `${w.id}_${i}_${Math.random().toString(36).substr(2, 5)}`; // Simple ID gen
                             // Adapter para os campos antigos
                             const exerciseId = ex.exerciseId || ex.id;
                             
                             await this.db!.runAsync(
                                     `INSERT INTO workout_exercises (
                                         id, workout_id, exercise_id, order_index, 
                                         created_at, synced
                                     ) VALUES (?, ?, ?, ?, ?, ?)`,
                                     [
                                         relationId,
                                         w.id,
                                         exerciseId,
                                         i,
                                         w.created_at || new Date().toISOString(),
                                         0 // Not synced yet
                                     ]
                                 );
                         }
                     }
                 }
             }
             devLog("[SQLiteStorage] Workout architecture migration completed.");
         }

         // 2. Migrar exercise_edits para exercise_values
         const hasExerciseValues = await this.db!.getFirstAsync(
            "SELECT count(*) as count FROM exercise_values"
         );

         if ((hasExerciseValues as any).count === 0) {
             devLog("[SQLiteStorage] Migrating exercise_edits to exercise_values...");
             // Check if exercise_edits exists
             try {
                const edits = await this.db!.getAllAsync<any>("SELECT * FROM exercise_edits");
                for (const edit of edits) {
                    await this.db!.runAsync(
                        `INSERT INTO exercise_values (
                            id, exercise_id, user_id, date, 
                            weight, sets, reps, duration, distance, 
                            created_at, synced
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            edit.id,
                            edit.exercise_id,
                            edit.user_id,
                            edit.date,
                            edit.weight,
                            edit.sets,
                            edit.reps,
                            edit.duration,
                            edit.distance,
                            edit.created_at,
                            edit.synced || 0
                        ]
                    );
                }
             } catch (e) {
                 // exercise_edits might not exist or empty
             }
             devLog("[SQLiteStorage] Exercise values migration completed.");
         }

      } catch (error) {
         devError("[SQLiteStorage] Error migrating workout architecture:", error);
      }
   }

   async getItem<T>(key: string): Promise<T[]> {
      return this.withRetry(async () => {
         // Aguarda escritas pendentes para leitura consistente
         await this.writeChain;
         const tableName = this.keyToTable(key);
         const result = await this.db!.getAllAsync(
            `SELECT * FROM ${tableName}`
         );
         return result.map((row: any) => this.parseRow(row));
      });
   }

   async setItem<T>(key: string, data: T[]): Promise<void> {
      return this.withRetry(async () => {
         const tableName = this.keyToTable(key);
         await this.enqueueWrite(async () => {
            await this.db!.execAsync("BEGIN IMMEDIATE");
            try {
               await this.db!.execAsync(`DELETE FROM ${tableName}`);
               for (const item of data) {
                  await this.insertRow(tableName, item);
               }
               await this.db!.execAsync("COMMIT");
            } catch (e) {
               await this.db!.execAsync("ROLLBACK");
               throw e;
            }
         });
      });
   }

   async addItem<T>(key: string, item: T): Promise<void> {
      return this.withRetry(async () => {
         const tableName = this.keyToTable(key);
         // Apenas algumas tabelas possuem colunas de sync
         const tablesWithSync = new Set([
            "workouts",
            "daily_checks",
            "meals",
            "water_intake",
            "measurements",
            "custom_exercises",
            "exercise_edits",
            "exercise_values",
            "workout_exercises",
            "exercises", // Adicionado
            "nutrition_goals",
         ]);
         const itemWithSync =
            tablesWithSync.has(tableName)
               ? {
                    ...item,
                    synced:
                       (item as any).synced !== undefined
                          ? (item as any).synced
                          : false,
                    last_synced_at: (item as any).last_synced_at || null,
                 }
               : item;
         await this.enqueueWrite(async () => {
            await this.insertRow(tableName, itemWithSync);
         });
      });
   }

   async updateItem<T>(
      key: string,
      id: string,
      updates: Partial<T>
   ): Promise<void> {
      return this.withRetry(async () => {
         const tableName = this.keyToTable(key);
         await this.enqueueWrite(async () => {
            const setClauses = Object.keys(updates)
               .map((k) => `${k} = ?`)
               .join(", ");
            const serializeValue = (v: any) =>
               typeof v === "object" && v !== null ? JSON.stringify(v) : v;
            const values = [...Object.values(updates).map(serializeValue), id];
            await this.db!.runAsync(
               `UPDATE ${tableName} SET ${setClauses} WHERE id = ?`,
               values
            );
         });
      });
   }

   async deleteItem(key: string, id: string): Promise<void> {
      return this.withRetry(async () => {
         const tableName = this.keyToTable(key);
         await this.enqueueWrite(async () => {
            await this.db!.runAsync(`DELETE FROM ${tableName} WHERE id = ?`, [
               id,
            ]);
         });
      });
   }

   async clear(): Promise<void> {
      return this.withRetry(async () => {
         const tables = [
            "workouts",
            "daily_checks",
            "meals",
            "water_intake",
            "measurements",
            "custom_exercises",
            "exercise_edits",
            "user_profile",
            "custom_foods",
            "recipes",
            "nutrition_goals",
            "workout_history",
            "sync_status",
         "workout_sessions",
            "workout_favorites",
            "workout_exercises",
            "exercise_values",
            "action_logs",
            "log_sync_runs",
         ];
         await this.enqueueWrite(async () => {
            await this.db!.execAsync("BEGIN IMMEDIATE");
            try {
               for (const table of tables) {
                  await this.db!.execAsync(`DELETE FROM ${table}`);
               }
               await this.db!.execAsync("COMMIT");
               devLog("[SQLiteStorage] All data cleared");
            } catch (e) {
               await this.db!.execAsync("ROLLBACK");
               throw e;
            }
         });
      });
   }

   // Utility methods
   async getAllKeys(): Promise<string[]> {
      return this.withRetry(async () => {
         const tables = await this.db!.getAllAsync<{ name: string }>(
         "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%fittrack%' OR name IN ('workouts', 'daily_checks', 'meals', 'water_intake', 'measurements', 'custom_exercises', 'exercise_edits', 'user_profile', 'custom_foods', 'recipes', 'nutrition_goals', 'sync_status', 'workout_sessions', 'workout_favorites', 'action_logs', 'log_sync_runs')"
         );
         return tables.map((t) => `@fittrack_${t.name}`);
      });
   }

   async getStorageSize(): Promise<number> {
      return this.withRetry(async () => {
         const result = await this.db!.getFirstAsync<{
            page_count: number;
            page_size: number;
         }>("PRAGMA page_count; PRAGMA page_size;");
         if (result) {
            return (result.page_count || 0) * (result.page_size || 0);
         }
         return 0;
      });
   }

   async vacuum(): Promise<void> {
      return this.withRetry(async () => {
         await this.db!.execAsync("VACUUM");
         devLog("[SQLiteStorage] Database vacuumed");
      });
   }

   private keyToTable(key: string): string {
      return key.replace("@fittrack_", "");
   }

   private parseRow(row: any): any {
      const parsed = { ...row };
      const safeParse = (value: any) => {
         if (value == null) return value;
         if (typeof value !== "string") return value;
         try {
            return JSON.parse(value);
         } catch {
            return value;
         }
      };

      // Parse JSON fields
      if (Object.prototype.hasOwnProperty.call(parsed, "exercises")) {
         parsed.exercises = safeParse(parsed.exercises);
      }
      if (Object.prototype.hasOwnProperty.call(parsed, "foods")) {
         parsed.foods = safeParse(parsed.foods);
      }
      if (Object.prototype.hasOwnProperty.call(parsed, "serving")) {
         parsed.serving = safeParse(parsed.serving);
      }
      if (Object.prototype.hasOwnProperty.call(parsed, "nutrition")) {
         parsed.nutrition = safeParse(parsed.nutrition);
      }

      // Convert SQLite integers to booleans
      if (parsed.completed !== undefined) {
         parsed.completed = parsed.completed === 1;
      }
      if (parsed.synced !== undefined) {
         parsed.synced = parsed.synced === 1;
      }
      if (parsed.onboarding_completed !== undefined) {
         parsed.onboarding_completed =
            parsed.onboarding_completed === 1 ||
            parsed.onboarding_completed === true;
      }

      return parsed;
   }

   private async insertRow(tableName: string, item: any): Promise<void> {
      const columns = Object.keys(item).join(", ");
      const placeholders = Object.keys(item)
         .map(() => "?")
         .join(", ");
      const values = Object.values(item).map((v) =>
         typeof v === "object" && v !== null ? JSON.stringify(v) : v
      );
      await this.db!.runAsync(
         `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`,
         values as any[]
      );
   }
}

// Export singleton instance (SQLite only)
export const storage: StorageAdapter = new SQLiteStorageAdapter();
