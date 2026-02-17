/**
 * Data Context - Global state for app data
 */

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
   executeQuery,
   executeInsert,
   executeUpdate,
   executeDelete,
   STORAGE_KEYS,
} from "@/services/database";
import { generateUUID } from "@/utils/uuid";
import { getBrazilDate, getBrazilDateTime } from "@/utils/dateUtils";
import { syncPushData } from "@/services/sync";
import { devError, devWarn } from "@/utils/logger";

interface Workout {
   id: string;
   user_id: string;
   name: string;
   type: "musculacao" | "aerobico";
   exercises: any[];
   created_at: string;
   last_done: string | null;
   times_done: number;
}

interface DailyCheck {
   id: string;
   user_id: string;
   date: string;
   workout_id: string | null;
   completed: boolean;
   created_at: string;
}

interface WaterIntake {
   id: string;
   user_id: string;
   date: string;
   amount_ml: number;
   created_at: string;
}

interface Meal {
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

interface Measurement {
   id: string;
   user_id: string;
   date: string;
   type: string;
   value: number;
   created_at: string;
}

interface ExerciseEdit {
   id: string;
   user_id: string;
   exercise_id: string;
   exercise_type: "musculacao" | "aerobico";
   date: string; // yyyy-mm-dd (Brazil date util)
   created_at: string; // datetime
   // musculação
   sets?: number;
   reps?: number;
   weight?: number;
   // aeróbico
   duration?: number;
}

interface CustomExercise {
   id: string;
   user_id: string;
   name: string;
   type: "musculacao" | "aerobico";
   category: string; // 'Personalizado' por padrão
   calories_per_hour?: number;
   calories_per_12_reps?: number;
   created_at: string;
}

interface NutritionGoals {
   id: string;
   user_id: string;
   daily_calories: number;
   protein_g: number;
   carbs_g: number;
   fat_g: number;
   water_ml?: number;
   updated_at: string;
}

interface DataContextType {
   workouts: Workout[];
   todayChecks: DailyCheck[];
   todayWater: WaterIntake | null;
   meals: Meal[];
   measurements: Measurement[];
   exerciseEdits: ExerciseEdit[];
   customExercises: CustomExercise[];
   nutritionGoals: NutritionGoals | null;
   loading: boolean;
   refreshData: () => Promise<void>;
   addWorkout: (
      workout: Omit<
         Workout,
         "id" | "user_id" | "created_at" | "last_done" | "times_done"
      >
   ) => Promise<void>;
   updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
   deleteWorkout: (id: string) => Promise<void>;
   completeDailyCheck: (workoutId: string) => Promise<void>;
   addWaterIntake: (amountMl: number) => Promise<void>;
   addMeal: (
      meal: Omit<Meal, "id" | "user_id" | "date" | "created_at">
   ) => Promise<void>;
   updateMeal: (
      id: string,
      updates: Partial<Omit<Meal, "id" | "user_id" | "date" | "created_at">>
   ) => Promise<void>;
   deleteMeal: (id: string) => Promise<void>;
   addMeasurement: (type: string, value: number) => Promise<void>;
   getMeasurementHistory: (type: string) => Measurement[];
   addExerciseEdit: (
      edit: Omit<ExerciseEdit, "id" | "user_id" | "date" | "created_at">
   ) => Promise<void>;
   getExerciseHistory: (exerciseId: string) => ExerciseEdit[];
   getExercisesWithHistory: () => {
      exercise_id: string;
      exercise_type: "musculacao" | "aerobico";
      lastDate: string;
   }[];
   addCustomExercise: (
      payload: Omit<CustomExercise, "id" | "user_id" | "created_at">
   ) => Promise<void>;
   getCustomExercisesByType: (
      type: "musculacao" | "aerobico"
   ) => CustomExercise[];
   updateNutritionGoals: (
      goals: Partial<Omit<NutritionGoals, "id" | "user_id" | "updated_at">>
   ) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(
   undefined
);

export function DataProvider({ children }: { children: ReactNode }) {
   const { user } = useAuth();
   const [workouts, setWorkouts] = useState<Workout[]>([]);
   const [todayChecks, setTodayChecks] = useState<DailyCheck[]>([]);
   const [todayWater, setTodayWater] = useState<WaterIntake | null>(null);
   const [meals, setMeals] = useState<Meal[]>([]);
   const [measurements, setMeasurements] = useState<Measurement[]>([]);
   const [exerciseEdits, setExerciseEdits] = useState<ExerciseEdit[]>([]);
   const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
   const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
   const [loading, setLoading] = useState(true);

   const getTodayDate = () => getBrazilDate();

   const refreshData = async () => {
      if (!user) {
         setLoading(false);
         return;
      }

      try {
         setLoading(true);

         // Load workouts
         const workoutsData = await executeQuery<Workout>(
            STORAGE_KEYS.WORKOUTS,
            (w) => w.user_id === user.id
         );
         setWorkouts(
            workoutsData
               .map((w) => ({
                  ...w,
                  exercises: Array.isArray(w.exercises) ? w.exercises : [],
               }))
               .sort(
                  (a, b) =>
                     new Date(b.created_at).getTime() -
                     new Date(a.created_at).getTime()
               )
         );

         // Load today's checks
         const today = getTodayDate();
         const checksData = await executeQuery<DailyCheck>(
            STORAGE_KEYS.DAILY_CHECKS,
            (c) => c.user_id === user.id && c.date === today
         );
         setTodayChecks(checksData);

         // Load today's water
         const waterData = await executeQuery<WaterIntake>(
            STORAGE_KEYS.WATER_INTAKE,
            (w) => w.user_id === user.id && w.date === today
         );
         setTodayWater(waterData.length > 0 ? waterData[0] : null);

         // Load today's meals
         const mealsData = await executeQuery<Meal>(
            STORAGE_KEYS.MEALS,
            (m) => m.user_id === user.id && m.date === today
         );
         setMeals(
            mealsData.sort(
               (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
            )
         );

         // Load measurements
         const measurementsData = await executeQuery<Measurement>(
            STORAGE_KEYS.MEASUREMENTS,
            (m) => m.user_id === user.id
         );
         setMeasurements(
            measurementsData.sort(
               (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
            )
         );

         // Load exercise edits
         const editsData = await executeQuery<ExerciseEdit>(
            STORAGE_KEYS.EXERCISE_EDITS,
            (e) => e.user_id === user.id
         );
         setExerciseEdits(
            editsData.sort(
               (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
            )
         );

         // Load custom exercises
         const customEx = await executeQuery<CustomExercise>(
            STORAGE_KEYS.CUSTOM_EXERCISES,
            (e) => e.user_id === user.id
         );
         setCustomExercises(
            customEx.sort(
               (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
            )
         );

         // Load nutrition goals - Get LATEST
         const goalsData = await executeQuery<NutritionGoals>(
            STORAGE_KEYS.NUTRITION_GOALS,
            (g) => g.user_id === user.id
         );
         // Sort by updated_at desc to get latest
         const latestGoal = goalsData.sort(
             (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
         )[0] || null;
         
         setNutritionGoals(latestGoal);

      } catch (error) {
         devError("Error refreshing data:", error);
      } finally {
         setLoading(false);
      }

      // Dispara sync de logs se necessário (Regras: > 5 logs ou > 6h)
      if (user?.email) {
         try {
            // fire-and-forget
            syncPushData();
         } catch (err) {
            devWarn("Sync logs failed (non-blocking):", err);
         }
      }
   };


   useEffect(() => {
      refreshData();
   }, [user]);

   const addWorkout = async (
      workout: Omit<
         Workout,
         "id" | "user_id" | "created_at" | "last_done" | "times_done"
      >
   ) => {
      if (!user) throw new Error("Usuário não autenticado");

      const id = generateUUID();
      const now = getBrazilDateTime();

      const newWorkout: Workout = {
         id,
         user_id: user.id,
         name: workout.name,
         type: workout.type,
         exercises: workout.exercises,
         created_at: now,
         last_done: null,
         times_done: 0,
      };

      await executeInsert(STORAGE_KEYS.WORKOUTS, newWorkout);

      // Log initial exercise configurations as edits
      const today = getBrazilDate();
      for (const ex of workout.exercises as any[]) {
         const edit: ExerciseEdit = {
            id: generateUUID(),
            user_id: user.id,
            exercise_id: ex.exerciseId,
            exercise_type: workout.type,
            date: today,
            created_at: now,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            duration: ex.duration,
         };
         await executeInsert(STORAGE_KEYS.EXERCISE_EDITS, edit);
      }
      await refreshData();
   };

   const updateWorkout = async (id: string, updates: Partial<Workout>) => {
      // Capture previous workout for diff
      const prev = workouts.find((w) => w.id === id) || null;

      await executeUpdate(STORAGE_KEYS.WORKOUTS, id, updates);

      // Log edits only for changed exercises if possible
      if (
         user &&
         prev &&
         updates.exercises &&
         Array.isArray(updates.exercises)
      ) {
         const today = getBrazilDate();
         const now = getBrazilDateTime();
         const prevById = new Map<string, any>(
            prev.exercises.map((e: any) => [e.exerciseId, e])
         );
         for (const ex of updates.exercises as any[]) {
            const p = prevById.get(ex.exerciseId);
            const changed =
               !p ||
               p.sets !== ex.sets ||
               p.reps !== ex.reps ||
               p.weight !== ex.weight ||
               p.duration !== ex.duration;
            if (changed) {
               const edit: ExerciseEdit = {
                  id: generateUUID(),
                  user_id: user.id,
                  exercise_id: ex.exerciseId,
                  exercise_type: prev.type,
                  date: today,
                  created_at: now,
                  sets: ex.sets,
                  reps: ex.reps,
                  weight: ex.weight,
                  duration: ex.duration,
               };
               await executeInsert(STORAGE_KEYS.EXERCISE_EDITS, edit);
            }
         }
      }
      await refreshData();
   };

   const deleteWorkout = async (id: string) => {
      await executeDelete(STORAGE_KEYS.WORKOUTS, id);
      await refreshData();
   };

   const completeDailyCheck = async (workoutId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const today = getTodayDate();
      
      // Check if already checked today
      const existing = await executeQuery<DailyCheck>(
         STORAGE_KEYS.DAILY_CHECKS,
         (c) => c.user_id === user.id && c.date === today && c.workout_id === workoutId
      );

      if (existing.length > 0) {
         // Already checked, do nothing or maybe toggle off? 
         // For now, let's assume we just want to ensure it's there.
         return;
      }

      const id = generateUUID();
      const now = getBrazilDateTime();

      const newCheck: DailyCheck = {
         id,
         user_id: user.id,
         date: today,
         workout_id: workoutId,
         completed: true,
         created_at: now,
      };

      await executeInsert(STORAGE_KEYS.DAILY_CHECKS, newCheck);

      // Update workout stats
      const workout = workouts.find((w) => w.id === workoutId);
      if (workout) {
         await executeUpdate<Workout>(STORAGE_KEYS.WORKOUTS, workoutId, {
            last_done: now,
            times_done: workout.times_done + 1,
         });
      }

      await refreshData();
   };

   const addWaterIntake = async (amountMl: number) => {
      if (!user) throw new Error("Usuário não autenticado");

      const today = getTodayDate();
      const now = getBrazilDateTime();

      if (todayWater) {
         // Update existing
         const newAmount = todayWater.amount_ml + amountMl;
         await executeUpdate<WaterIntake>(STORAGE_KEYS.WATER_INTAKE, todayWater.id, {
            amount_ml: newAmount,
            id: todayWater.id,
            user_id: user.id,
            date: todayWater.date,
            created_at: todayWater.created_at,
         });
      } else {
         // Create new
         const id = generateUUID();
         const newWater: WaterIntake = {
            id,
            user_id: user.id,
            date: today,
            amount_ml: amountMl,
            created_at: now,
         };
         await executeInsert(STORAGE_KEYS.WATER_INTAKE, newWater);
      }

      await refreshData();
   };

   const addMeal = async (
      meal: Omit<Meal, "id" | "user_id" | "date" | "created_at">
   ) => {
      if (!user) throw new Error("Usuário não autenticado");

      const id = generateUUID();
      const today = getTodayDate();
      const now = getBrazilDateTime();

      const newMeal: Meal = {
         id,
         user_id: user.id,
         date: today,
         meal_name: meal.meal_name,
         foods: meal.foods,
         total_calories: meal.total_calories,
         total_protein: meal.total_protein,
         total_carbs: meal.total_carbs,
         total_fat: meal.total_fat,
         created_at: now,
      };

      await executeInsert(STORAGE_KEYS.MEALS, newMeal);
      await refreshData();
   };

   const updateMeal = async (
      id: string,
      updates: Partial<Omit<Meal, "id" | "user_id" | "date" | "created_at">>
   ) => {
      // Não altera date nem created_at por padrão; apenas campos editáveis
      await executeUpdate<Meal>(
         STORAGE_KEYS.MEALS,
         id,
         updates as Partial<Meal>
      );
      await refreshData();
   };

   const deleteMeal = async (id: string) => {
      await executeDelete<Meal>(STORAGE_KEYS.MEALS, id);
      await refreshData();
   };

   const addMeasurement = async (type: string, value: number) => {
      if (!user) throw new Error("Usuário não autenticado");

      const id = generateUUID();
      const today = getTodayDate();
      const now = getBrazilDateTime();

      const newMeasurement: Measurement = {
         id,
         user_id: user.id,
         date: today,
         type,
         value,
         created_at: now,
      };

      await executeInsert(STORAGE_KEYS.MEASUREMENTS, newMeasurement);
      await refreshData();
   };

   const getMeasurementHistory = (type: string): Measurement[] => {
      return measurements
         .filter((m) => m.type === type)
         .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
         );
   };

   const addExerciseEdit = async (
      edit: Omit<ExerciseEdit, "id" | "user_id" | "date" | "created_at">
   ) => {
      if (!user) throw new Error("Usuário não autenticado");
      const id = generateUUID();
      const today = getBrazilDate();
      const now = getBrazilDateTime();
      const newEdit: ExerciseEdit = {
         id,
         user_id: user.id,
         date: today,
         created_at: now,
         ...edit,
      } as ExerciseEdit;
      await executeInsert(STORAGE_KEYS.EXERCISE_EDITS, newEdit);
      await refreshData();
   };

   const getExerciseHistory = (exerciseId: string): ExerciseEdit[] => {
      return exerciseEdits
         .filter((e) => e.exercise_id === exerciseId)
         .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
         );
   };

   const getExercisesWithHistory = () => {
      const map = new Map<
         string,
         {
            exercise_id: string;
            exercise_type: "musculacao" | "aerobico";
            lastDate: string;
         }
      >();
      for (const e of exerciseEdits) {
         const prev = map.get(e.exercise_id);
         if (!prev || new Date(e.date) > new Date(prev.lastDate)) {
            map.set(e.exercise_id, {
               exercise_id: e.exercise_id,
               exercise_type: e.exercise_type,
               lastDate: e.date,
            });
         }
      }
      return Array.from(map.values()).sort(
         (a, b) =>
            new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      );
   };

   const addCustomExercise = async (
      payload: Omit<CustomExercise, "id" | "user_id" | "created_at">
   ) => {
      if (!user) throw new Error("Usuário não autenticado");
      const id = generateUUID();
      const now = getBrazilDateTime();
      const newItem: CustomExercise = {
         id,
         user_id: user.id,
         name: payload.name,
         type: payload.type,
         category: payload.category || "Personalizado",
         calories_per_hour: payload.calories_per_hour,
         calories_per_12_reps: payload.calories_per_12_reps,
         created_at: now,
      };
      await executeInsert(STORAGE_KEYS.CUSTOM_EXERCISES, newItem);
      await refreshData();
   };

   const getCustomExercisesByType = (
      type: "musculacao" | "aerobico"
   ): CustomExercise[] => {
      return customExercises.filter((e) => e.type === type);
   };

   const updateNutritionGoals = async (
      goals: Partial<Omit<NutritionGoals, "id" | "user_id" | "updated_at">>
   ) => {
      if (!user) throw new Error("Usuário não autenticado");
      const now = getBrazilDateTime();
      const id = generateUUID();

      // Get latest to merge with
      const current = nutritionGoals || {
         daily_calories: 2000,
         protein_g: 150,
         carbs_g: 250,
         fat_g: 70,
         water_ml: 2500 // Default fallback
      };

      const newGoals: NutritionGoals = {
         id,
         user_id: user.id,
         daily_calories: goals.daily_calories ?? current.daily_calories,
         protein_g: goals.protein_g ?? current.protein_g,
         carbs_g: goals.carbs_g ?? current.carbs_g,
         fat_g: goals.fat_g ?? current.fat_g,
         water_ml: goals.water_ml ?? current.water_ml,
         updated_at: now,
      };

      // Always INSERT a new record to keep history
      await executeInsert(STORAGE_KEYS.NUTRITION_GOALS, newGoals);
      await refreshData();
   };

   return (
      <DataContext.Provider
         value={{
            workouts,
            todayChecks,
            todayWater,
            meals,
            measurements,
            exerciseEdits,
            customExercises,
            nutritionGoals,
            loading,
            refreshData,
            addWorkout,
            updateWorkout,
            deleteWorkout,
            completeDailyCheck,
            addWaterIntake,
            addMeal,
            updateMeal,
            deleteMeal,
            addMeasurement,
            getMeasurementHistory,
            addExerciseEdit,
            getExerciseHistory,
            getExercisesWithHistory,
            addCustomExercise,
            getCustomExercisesByType,
            updateNutritionGoals,
         }}
      >
         {children}
      </DataContext.Provider>
   );
}
