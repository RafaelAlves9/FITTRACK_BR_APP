/**
 * Workout Session Screen
 * Exercise execution with timer and video
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { devError } from '@/utils/logger';
import { globalStyles } from '@/constants/styles';
import { Button } from '@/components';
import { ExerciseVideoDisplay } from '@/components/workout';
import { PresetWorkout, WorkoutExercise, WorkoutCompleteSummary } from '@/types/workout';
import { getWorkoutById } from '@/services/presetWorkouts';
import { useAuth } from '@/contexts/AuthContext';

const REST_DURATION = 30; // 30 seconds rest between exercises

export default function WorkoutSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  // State
  const [workout, setWorkout] = useState<PresetWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [startTime, setStartTime] = useState<string>('');
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values
  const progressScale = useSharedValue(1);
  const progressRotation = useSharedValue(0);

  // Load workout
  const loadWorkout = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const workoutData = await getWorkoutById(id);
      if (workoutData) {
        setWorkout(workoutData);
        setRemainingTime(workoutData.exercises[0]?.duration || 0);
        setStartTime(new Date().toISOString());
      }
    } catch (error) {
      devError('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  // Timer logic
  useEffect(() => {
    if (loading || isPaused || !workout) return;

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Time's up for current exercise/rest
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      
      setTotalElapsedTime(prev => prev + 1);
      
      // Calculate calories
      if (!isResting) {
        const currentExercise = workout.exercises[currentExerciseIndex];
        if (currentExercise) {
          setCaloriesBurned(prev => prev + (currentExercise.caloriesPerMinute / 60));
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, isPaused, workout, currentExerciseIndex, isResting]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!workout) return;

    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isResting) {
      // Rest is over, move to next exercise
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex >= workout.exercises.length) {
        // Workout complete
        handleWorkoutComplete();
      } else {
        setCurrentExerciseIndex(nextIndex);
        setRemainingTime(workout.exercises[nextIndex].duration);
        setIsResting(false);
      }
    } else {
      // Exercise is over, start rest (unless it's the last exercise)
      if (currentExerciseIndex >= workout.exercises.length - 1) {
        // Last exercise, complete workout
        handleWorkoutComplete();
      } else {
        setIsResting(true);
        setRemainingTime(REST_DURATION);
      }
    }

    // Animation pulse
    progressScale.value = withSpring(1.1, {}, () => {
      progressScale.value = withSpring(1);
    });
  }, [workout, currentExerciseIndex, isResting]);

  // Handle workout complete
  const handleWorkoutComplete = () => {
    if (!workout) return;

    const summary: WorkoutCompleteSummary = {
      workoutId: workout.id,
      workoutName: workout.name,
      exercisesCompleted: workout.exercises.length,
      totalExercises: workout.exercises.length,
      caloriesBurned: Math.round(caloriesBurned),
      totalDuration: totalElapsedTime,
      startedAt: startTime,
      completedAt: new Date().toISOString(),
    };

    // Navigate to complete screen with summary
    router.replace({
      pathname: '/workout-complete',
      params: {
        summary: JSON.stringify(summary),
      },
    });
  };

  // Skip to next exercise
  const handleSkip = () => {
    if (!workout) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isResting) {
      // Skip rest
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex >= workout.exercises.length) {
        handleWorkoutComplete();
      } else {
        setCurrentExerciseIndex(nextIndex);
        setRemainingTime(workout.exercises[nextIndex].duration);
        setIsResting(false);
      }
    } else {
      // Skip exercise
      if (currentExerciseIndex >= workout.exercises.length - 1) {
        handleWorkoutComplete();
      } else {
        setIsResting(true);
        setRemainingTime(REST_DURATION);
      }
    }
  };

  // Toggle pause
  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(prev => !prev);
  };

  // Exit workout
  const handleExit = () => {
    Alert.alert(
      'Sair do Treino',
      'Tem certeza que deseja sair? Seu progresso será perdido.',
      [
        { text: 'Continuar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const getProgress = (): number => {
    if (!workout) return 0;
    const currentExercise = workout.exercises[currentExerciseIndex];
    const totalDuration = isResting ? REST_DURATION : (currentExercise?.duration || 0);
    return totalDuration > 0 ? (totalDuration - remainingTime) / totalDuration : 0;
  };

  // Animated styles
  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Treino não encontrado</Text>
        <Button title="Voltar" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = getProgress();

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleExit}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isResting ? 'Descanso' : currentExercise?.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            Exercício {currentExerciseIndex + 1} de {workout.exercises.length}
          </Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Exercise Image/Video */}
        <View style={styles.mediaContainer}>
          {isResting ? (
            <View style={styles.restContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.restGradient}
              >
                <Text style={styles.restText}>Descanse</Text>
                <Text style={styles.restSubtext}>Próximo: {workout.exercises[currentExerciseIndex + 1]?.name}</Text>
              </LinearGradient>
            </View>
          ) : (
            <ExerciseVideoDisplay
              imageUrl={currentExercise.imageUrl}
              exerciseName={currentExercise.name}
              remainingTime={remainingTime}
              isResting={isResting}
            />
          )}
        </View>

        {/* Timer */}
        <Animated.View style={[styles.timerContainer, progressAnimatedStyle]}>
          <View style={styles.timerCircle}>
            <Text style={[styles.timerText, isResting && styles.timerTextResting]}>
              {formatTime(remainingTime)}
            </Text>
            <Text style={styles.timerLabel}>
              {isResting ? 'Tempo de descanso' : 'Tempo restante'}
            </Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
            <Text style={styles.statValue}>{formatTime(totalElapsedTime)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={20} color={colors.warning} />
            <Text style={styles.statValue}>{Math.round(caloriesBurned)}</Text>
            <Text style={styles.statLabel}>Calorias</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={styles.statValue}>{currentExerciseIndex}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleSkip}
        >
          <Ionicons name="play-skip-forward" size={28} color={colors.text.primary} />
          <Text style={styles.controlLabel}>Pular</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.mainControlButton}
          onPress={handlePause}
        >
          <LinearGradient
            colors={isPaused ? colors.gradients.success : colors.gradients.primary}
            style={styles.mainControlGradient}
          >
            <Ionicons 
              name={isPaused ? 'play' : 'pause'} 
              size={40} 
              color={colors.text.primary} 
            />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleWorkoutComplete}
        >
          <Ionicons name="checkmark-done" size={28} color={colors.text.primary} />
          <Text style={styles.controlLabel}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  progressBarContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  mediaContainer: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  restContainer: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  restGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  restText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  restSubtext: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary[500],
  },
  timerText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  timerTextResting: {
    color: colors.primary[400],
  },
  timerLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  controlButton: {
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  controlLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  mainControlButton: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  mainControlGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

