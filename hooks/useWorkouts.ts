/**
 * Workouts Hook - Business logic for workouts
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as WorkoutService from '@/services/workouts';
import { devError } from '@/utils/logger';
import type { Workout, WorkoutExercise, WorkoutHistory } from '@/services/workouts';

export const useWorkouts = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = async () => {
    if (!user?.id) return;
    
    try {
      const data = await WorkoutService.getWorkouts(user.id);
      setWorkouts(data);
    } catch (error) {
      devError('Error loading workouts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [user?.id]);

  const refresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
  };

  const createWorkout = async (
    name: string,
    type: 'musculacao' | 'aerobico',
    exercises: WorkoutExercise[]
  ) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const newWorkout = await WorkoutService.createWorkout({
      user_id: user.id,
      name,
      type,
      exercises,
    });
    
    setWorkouts(prev => [...prev, newWorkout]);
    return newWorkout;
  };

  const updateWorkout = async (workoutId: string, updates: Partial<Workout>) => {
    await WorkoutService.updateWorkout(workoutId, updates);
    setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...updates } : w));
  };

  const deleteWorkout = async (workoutId: string) => {
    await WorkoutService.deleteWorkout(workoutId);
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const markDone = async (workoutId: string) => {
    await WorkoutService.markWorkoutDone(workoutId);
    await loadWorkouts(); // Reload to get updated times_done and last_done
  };

  const getExerciseHistory = async (workoutId: string, exerciseId: string): Promise<WorkoutHistory[]> => {
    return await WorkoutService.getExerciseHistory(workoutId, exerciseId);
  };

  const addHistory = async (
    workoutId: string,
    exerciseId: string,
    data: { weight?: number; sets?: number; reps?: number }
  ) => {
    await WorkoutService.addWorkoutHistory({
      workout_id: workoutId,
      exercise_id: exerciseId,
      date: new Date().toISOString(),
      ...data,
    });
  };

  return {
    workouts,
    loading,
    refreshing,
    refresh,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    markDone,
    getExerciseHistory,
    addHistory,
  };
};
