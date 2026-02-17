/**
 * Custom Workouts Service
 * Manages user-created workouts with exercises
 */

import { 
  CustomWorkout, 
  WorkoutExerciseItem, 
  ExerciseHistoryEntry,
  WorkoutStats,
  ExerciseType,
} from '@/types/customWorkout';
import { 
  executeQuery, 
  executeInsert, 
  executeUpdate, 
  executeDelete,
  executeBatchDelete,
  STORAGE_KEYS,
  storage // Importar storage direto para acesso raw se necessario
} from './database';
import { getExerciseById } from './exercises';
import { generateUUID } from '@/utils/uuid';
import { getBrazilDate, getBrazilDateTime } from '@/utils/dateUtils';
import { devError } from '@/utils/logger';

// Helper para hidratar exercícios do treino usando JOIN e buscando últimos valores
const fetchWorkoutExercises = async (workoutId: string): Promise<WorkoutExerciseItem[]> => {
    const db = (storage as any).db;
    if (!db) return [];
    
    // 1. Pegar a lista de exercícios do treino
    const exercisesList = await db.getAllAsync(`
        SELECT 
            we.exercise_id as exerciseId,
            e.name as exerciseName,
            e.type as exerciseType,
            e.category,
            e.image_url,
            e.gif_url,
            e.default_sets,
            e.default_reps,
            e.default_weight,
            e.default_duration,
            we.order_index
        FROM workout_exercises we
        LEFT JOIN exercises e ON we.exercise_id = e.id
        WHERE we.workout_id = ?
        ORDER BY we.order_index ASC
    `, [workoutId]);

    // 2. Para cada exercício, buscar o último valor registrado em exercise_values
    // Otimização: Poderíamos fazer isso em uma única query com Window Functions, 
    // mas o suporte do SQLite pode variar. Vamos fazer queries individuais por enquanto 
    // ou buscar todos os values desses exercícios e filtrar em memória.
    
    // Vamos buscar os últimos valores de todos os exercícios envolvidos
    const exerciseIds = exercisesList.map((e: any) => e.exerciseId);
    if (exerciseIds.length === 0) return [];

    const placeholders = exerciseIds.map(() => '?').join(',');
    const latestValuesRows = await db.getAllAsync(`
        SELECT * FROM exercise_values 
        WHERE exercise_id IN (${placeholders})
        ORDER BY created_at DESC
    `, exerciseIds);

    // Mapa para acesso rápido ao último valor
    const latestValuesMap = new Map();
    for (const val of (latestValuesRows as any[])) {
        if (!latestValuesMap.has(val.exercise_id)) {
            latestValuesMap.set(val.exercise_id, val);
        }
    }

    return exercisesList.map((r: any) => {
        const latest = latestValuesMap.get(r.exerciseId);
        
        // Prioridade: Último valor registrado > Valor default do exercício > 0
        return {
            exerciseId: r.exerciseId,
            exerciseName: r.exerciseName || 'Exercício Removido',
            exerciseType: r.exerciseType || 'musculacao',
            category: r.category || 'Outros',
            image_url: r.image_url,
            gif_url: r.gif_url,
            // Valores dinâmicos (do histórico ou defaults)
            sets: latest?.sets ?? r.default_sets ?? 0,
            reps: latest?.reps ?? r.default_reps ?? 0,
            weight: latest?.weight ?? r.default_weight ?? 0,
            duration: latest?.duration ?? r.default_duration ?? 0,
            distance: latest?.distance ?? 0
        };
    });
};

/**
 * Get all workouts for a user
 */
export const getUserWorkouts = async (userId: string): Promise<CustomWorkout[]> => {
  try {
    const workouts = await executeQuery<any>(
      STORAGE_KEYS.WORKOUTS,
      (w) => w.user_id === userId
    );
    
    // Hidratar com exercícios
    const hydratedWorkouts = await Promise.all(workouts.map(async (w) => {
        const exercises = await fetchWorkoutExercises(w.id);
        return {
            ...w,
            exercises,
            total_exercises: exercises.length,
            estimated_calories: calculateWorkoutCalories(exercises),
        };
    }));

    return hydratedWorkouts
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch (error) {
    devError('[CustomWorkouts] Error getting user workouts:', error);
    return [];
  }
};

/**
 * Get workouts by type
 */
export const getWorkoutsByType = async (
  userId: string, 
  type: ExerciseType
): Promise<CustomWorkout[]> => {
  try {
    const workouts = await getUserWorkouts(userId);
    return workouts.filter(w => w.type === type);
  } catch (error) {
    devError('[CustomWorkouts] Error getting workouts by type:', error);
    return [];
  }
};

/**
 * Get workout by ID
 */
export const getWorkoutById = async (
  workoutId: string
): Promise<CustomWorkout | null> => {
  try {
    const workouts = await executeQuery<CustomWorkout>(
      STORAGE_KEYS.WORKOUTS,
      (w) => w.id === workoutId
    );
    
    if (workouts.length === 0) return null;
    
    const workout = workouts[0];
    const exercises = await fetchWorkoutExercises(workoutId);

    return {
      ...workout,
      exercises,
      total_exercises: exercises.length,
      estimated_calories: calculateWorkoutCalories(exercises),
    };
  } catch (error) {
    devError('[CustomWorkouts] Error getting workout by ID:', error);
    return null;
  }
};

/**
 * Create new workout
 */
export const createWorkout = async (
  userId: string,
  name: string,
  type: ExerciseType,
  exercises: WorkoutExerciseItem[] = []
): Promise<string> => {
  try {
    const id = generateUUID();
    const now = getBrazilDateTime();
    
    // Inserir workout (sem coluna exercises JSON)
    // Opcionalmente podemos salvar uma string vazia ou array vazio em 'exercises' 
    // se a coluna ainda for obrigatória no schema legado, mas idealmente ignoramos.
    const newWorkout: any = {
      id,
      user_id: userId,
      name,
      type,
      exercises: [], // Legacy compatibility placeholder
      created_at: now,
      last_done: null,
      times_done: 0,
      total_exercises: exercises.length,
      estimated_calories: calculateWorkoutCalories(exercises),
    };
    
    await executeInsert(STORAGE_KEYS.WORKOUTS, newWorkout);

    // Inserir exercícios na tabela relacional usando executeInsert para garantir logs
    if (exercises.length > 0) {
        for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            const relationId = generateUUID();
            // Apenas vínculo, sem valores
            const relationItem = {
                id: relationId,
                workout_id: id,
                exercise_id: ex.exerciseId,
                order_index: i,
                created_at: now,
                synced: false
            };
            await executeInsert(STORAGE_KEYS.WORKOUT_EXERCISES, relationItem);
        }
    }
    
    return id;
  } catch (error) {
    devError('[CustomWorkouts] Error creating workout:', error);
    throw error;
  }
};

/**
 * Update workout
 */
export const updateWorkout = async (
  workoutId: string,
  updates: Partial<CustomWorkout>
): Promise<void> => {
  try {
    // Get previous workout for comparison
    const prev = await getWorkoutById(workoutId);
    if (!prev) throw new Error("Workout not found");
    
    // Atualizar tabela principal
    const { exercises, ...workoutUpdates } = updates;
    if (Object.keys(workoutUpdates).length > 0) {
        await executeUpdate(STORAGE_KEYS.WORKOUTS, workoutId, workoutUpdates);
    }
    
    // Logica de atualização de exercícios e histórico
    if (exercises && Array.isArray(exercises)) {
      const today = getBrazilDate();
      const now = getBrazilDateTime();
      const db = (storage as any).db;

      // Log changes (History) logic
      // Compara prev.exercises com exercises (updates)
      const prevById = new Map<string, WorkoutExerciseItem>(
        prev.exercises.map(e => [e.exerciseId, e])
      );

      for (const ex of exercises) {
        const p = prevById.get(ex.exerciseId);
        
        if (p) {
          const changed = 
            p.sets !== ex.sets ||
            p.reps !== ex.reps ||
            p.weight !== ex.weight ||
            p.duration !== ex.duration ||
            p.distance !== ex.distance;
          
          if (changed) {
            // Omit exercise_type as it is not in the exercise_values table schema
            // and should be derived from the exercise definition
            const historyEntry = {
              id: generateUUID(),
              user_id: prev.user_id,
              exercise_id: ex.exerciseId,
              date: today,
              created_at: now,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              duration: ex.duration,
              distance: ex.distance,
              synced: false
            };
            // Usando nova tabela exercise_values
            await executeInsert(STORAGE_KEYS.EXERCISE_VALUES, historyEntry);
          }
        }
      }

      // Atualizar a tabela de relação workout_exercises
      // Estratégia: Delete all and re-insert (Simplifica manutenção de ordem e limpeza)
      
      // 1. Buscar IDs antigos para deletar com log
      const oldRelations = await executeQuery<{id: string}>(
          STORAGE_KEYS.WORKOUT_EXERCISES,
          (item: any) => item.workout_id === workoutId
      );
      
      if (oldRelations.length > 0) {
          await executeBatchDelete(
              STORAGE_KEYS.WORKOUT_EXERCISES, 
              oldRelations.map(r => r.id)
          );
      }
      
      // 2. Inserir novos com log
      for (let i = 0; i < exercises.length; i++) {
            const ex = exercises[i];
            const relationId = generateUUID();
            // Apenas vínculo
            const relationItem = {
                id: relationId,
                workout_id: workoutId,
                exercise_id: ex.exerciseId,
                order_index: i,
                created_at: now,
                synced: false
            };
            await executeInsert(STORAGE_KEYS.WORKOUT_EXERCISES, relationItem);
      }
    }
  } catch (error) {
    devError('[CustomWorkouts] Error updating workout:', error);
    throw error;
  }
};

/**
 * Delete workout
 */
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  try {
    await executeDelete(STORAGE_KEYS.WORKOUTS, workoutId);
  } catch (error) {
    devError('[CustomWorkouts] Error deleting workout:', error);
    throw error;
  }
};

/**
 * Add exercise to workout
 */
export const addExerciseToWorkout = async (
  workoutId: string,
  exerciseId: string
): Promise<void> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    // Get exercise details
    const exercise = await getExerciseById(exerciseId);
    if (!exercise) throw new Error('Exercise not found');
    
    // Create workout exercise item with default values
    const newExercise: WorkoutExerciseItem = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseType: exercise.type,
      category: exercise.category,
      image_url: exercise.image_url,
      gif_url: exercise.gif_url,
      sets: exercise.default_sets,
      reps: exercise.default_reps,
      weight: exercise.default_weight,
      duration: exercise.default_duration,
    };
    
    const updatedExercises = [...workout.exercises, newExercise];
    
    await updateWorkout(workoutId, {
      exercises: updatedExercises,
      total_exercises: updatedExercises.length,
      estimated_calories: calculateWorkoutCalories(updatedExercises),
    });
  } catch (error) {
    devError('[CustomWorkouts] Error adding exercise to workout:', error);
    throw error;
  }
};

/**
 * Add multiple exercises to workout
 */
export const addExercisesToWorkout = async (
  workoutId: string,
  exerciseIds: string[]
): Promise<void> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    const newExercises: WorkoutExerciseItem[] = [];
    
    for (const exerciseId of exerciseIds) {
      const exercise = await getExerciseById(exerciseId);
      if (exercise) {
        newExercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          exerciseType: exercise.type,
          category: exercise.category,
          image_url: exercise.image_url,
          gif_url: exercise.gif_url,
          sets: exercise.default_sets,
          reps: exercise.default_reps,
          weight: exercise.default_weight,
          duration: exercise.default_duration,
        });
      }
    }
    
    const updatedExercises = [...workout.exercises, ...newExercises];
    
    await updateWorkout(workoutId, {
      exercises: updatedExercises,
      total_exercises: updatedExercises.length,
      estimated_calories: calculateWorkoutCalories(updatedExercises),
    });
  } catch (error) {
    devError('[CustomWorkouts] Error adding exercises to workout:', error);
    throw error;
  }
};

/**
 * Remove exercise from workout
 */
export const removeExerciseFromWorkout = async (
  workoutId: string,
  exerciseId: string
): Promise<void> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    const updatedExercises = workout.exercises.filter(
      e => e.exerciseId !== exerciseId
    );
    
    await updateWorkout(workoutId, {
      exercises: updatedExercises,
      total_exercises: updatedExercises.length,
      estimated_calories: calculateWorkoutCalories(updatedExercises),
    });
  } catch (error) {
    devError('[CustomWorkouts] Error removing exercise from workout:', error);
    throw error;
  }
};

/**
 * Update exercise values in workout
 */
export const updateExerciseInWorkout = async (
  workoutId: string,
  exerciseId: string,
  updates: Partial<WorkoutExerciseItem>
): Promise<void> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    const updatedExercises = workout.exercises.map(e =>
      e.exerciseId === exerciseId ? { ...e, ...updates } : e
    );
    
    await updateWorkout(workoutId, {
      exercises: updatedExercises,
      estimated_calories: calculateWorkoutCalories(updatedExercises),
    });
  } catch (error) {
    devError('[CustomWorkouts] Error updating exercise in workout:', error);
    throw error;
  }
};

/**
 * Get exercise history
 */
export const getExerciseHistory = async (
  userId: string,
  exerciseId: string
): Promise<ExerciseHistoryEntry[]> => {
  try {
    // Need to join with exercises or manual query because executeQuery is too simple
    // and exercise_values table doesn't have exercise_type anymore.
    const db = (storage as any).db;
    if (!db) return [];

    const history = await db.getAllAsync(`
        SELECT ev.*, e.type as exercise_type 
        FROM exercise_values ev
        LEFT JOIN exercises e ON ev.exercise_id = e.id
        WHERE ev.user_id = ? AND ev.exercise_id = ?
        ORDER BY ev.created_at DESC
    `, [userId, exerciseId]);
    
    return history as ExerciseHistoryEntry[];
  } catch (error) {
    devError('[CustomWorkouts] Error getting exercise history:', error);
    return [];
  }
};

/**
 * Get workout statistics
 */
export const getWorkoutStats = async (userId: string): Promise<WorkoutStats> => {
  try {
    const workouts = await getUserWorkouts(userId);
    
    const totalWorkouts = workouts.length;
    const totalExercises = workouts.reduce(
      (sum, w) => sum + (w.total_exercises || 0), 
      0
    );
    const estimatedCalories = workouts.reduce(
      (sum, w) => sum + (w.estimated_calories || 0), 
      0
    );
    
    const lastWorkout = workouts
      .filter(w => w.last_done)
      .sort((a, b) => 
        new Date(b.last_done!).getTime() - new Date(a.last_done!).getTime()
      )[0];
    
    return {
      totalWorkouts,
      totalExercises,
      estimatedCalories,
      lastWorkoutDate: lastWorkout?.last_done || null,
    };
  } catch (error) {
    devError('[CustomWorkouts] Error getting workout stats:', error);
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      estimatedCalories: 0,
      lastWorkoutDate: null,
    };
  }
};

/**
 * Calculate estimated calories for a workout
 */
const calculateWorkoutCalories = (exercises: WorkoutExerciseItem[]): number => {
  let totalCalories = 0;
  
  for (const ex of exercises) {
    if (ex.exerciseType === 'musculacao') {
      // For strength training: calories per set
      const sets = ex.sets || 0;
      const reps = ex.reps || 0;
      // Estimate: ~0.5 calories per rep (varies by exercise)
      totalCalories += sets * reps * 0.5;
    } else {
      // For aerobic: calories per minute
      const duration = ex.duration || 0;
      // Estimate: ~10 calories per minute (varies by intensity)
      totalCalories += duration * 10;
    }
  }
  
  return Math.round(totalCalories);
};

/**
 * Mark workout as completed
 */
export const completeWorkout = async (workoutId: string): Promise<void> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    const now = getBrazilDateTime();
    
    await updateWorkout(workoutId, {
      last_done: now,
      times_done: workout.times_done + 1,
    });
  } catch (error) {
    devError('[CustomWorkouts] Error completing workout:', error);
    throw error;
  }
};

/**
 * Duplicate workout
 */
export const duplicateWorkout = async (
  workoutId: string,
  newName?: string
): Promise<string> => {
  try {
    const workout = await getWorkoutById(workoutId);
    if (!workout) throw new Error('Workout not found');
    
    const name = newName || `${workout.name} (Cópia)`;
    
    return await createWorkout(
      workout.user_id,
      name,
      workout.type,
      workout.exercises // Isso agora funciona corretamente criando as entradas na nova tabela
    );
  } catch (error) {
    devError('[CustomWorkouts] Error duplicating workout:', error);
    throw error;
  }
};

