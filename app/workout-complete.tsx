/**
 * Workout Complete Screen
 * Shows workout completion summary with stats
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { Button } from '@/components';
import { WorkoutCompleteSummary } from '@/types/workout';
import { saveWorkoutSession, toggleFavorite, isWorkoutFavorited } from '@/services/presetWorkouts';
import { devError } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';

// Trophy image placeholder - you can replace with actual asset
const TROPHY_IMAGE = 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400';

export default function WorkoutCompleteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { summary: summaryParam } = useLocalSearchParams<{ summary: string }>();
  const { user } = useAuth();

  // Parse summary from params
  const summary: WorkoutCompleteSummary | null = summaryParam 
    ? JSON.parse(summaryParam) 
    : null;

  // State
  const [isFavorited, setIsFavorited] = useState(false);
  const [saved, setSaved] = useState(false);

  // Animation values
  const trophyScale = useSharedValue(0);
  const trophyRotation = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(1);

  // Animated styles
  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotation.value}deg` },
    ],
  }));

  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 20 }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: (1 - buttonsOpacity.value) * 20 }],
  }));

  // Start animations
  useEffect(() => {
    const startAnimations = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Trophy animation
      trophyScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      trophyRotation.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 200 }),
        withTiming(0, { duration: 100 })
      );

      // Stats animation
      statsOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

      // Buttons animation
      buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

      // Confetti fade out
      confettiOpacity.value = withDelay(2000, withTiming(0, { duration: 1000 }));
    };

    startAnimations();
  }, []);

  // Save workout session
  useEffect(() => {
    const saveSession = async () => {
      if (!user || !summary || saved) return;

      try {
        await saveWorkoutSession({
          user_id: user.id,
          workout_id: summary.workoutId,
          workout_name: summary.workoutName,
          started_at: summary.startedAt,
          completed_at: summary.completedAt,
          duration_seconds: summary.totalDuration,
          exercises_completed: summary.exercisesCompleted,
          total_exercises: summary.totalExercises,
          calories_burned: summary.caloriesBurned,
        });
        setSaved(true);

        // Check if favorited
        const favorited = await isWorkoutFavorited(user.id, summary.workoutId);
        setIsFavorited(favorited);
      } catch (error) {
        devError('Error saving workout session:', error);
      }
    };

    saveSession();
  }, [user, summary, saved]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!user || !summary) return;
    
    const newFavorited = await toggleFavorite(user.id, summary.workoutId);
    setIsFavorited(newFavorited);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Navigate to another workout
  const handleNextWorkout = () => {
    router.replace('/(tabs)/workouts');
  };

  // Navigate home
  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  if (!summary) {
    return (
      <View style={[globalStyles.container, styles.container]}>
        <Text style={styles.errorText}>Erro ao carregar resumo</Text>
        <Button title="Voltar" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, styles.container, { paddingTop: insets.top }]}>
      {/* Confetti Background Effect */}
      <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
        {/* You could add actual confetti animation here */}
      </Animated.View>

      {/* Trophy */}
      <Animated.View style={[styles.trophyContainer, trophyAnimatedStyle]}>
        <View style={styles.trophy}>
          <Ionicons name="trophy" size={100} color="#FFD700" />
        </View>
        {/* Decorative elements */}
        <View style={styles.sparkles}>
          <Ionicons name="sparkles" size={24} color={colors.warning} style={styles.sparkle1} />
          <Ionicons name="star" size={20} color={colors.warning} style={styles.sparkle2} />
          <Ionicons name="sparkles" size={24} color={colors.warning} style={styles.sparkle3} />
          <Ionicons name="star" size={16} color={colors.warning} style={styles.sparkle4} />
        </View>
      </Animated.View>

      {/* Congratulations Text */}
      <Text style={styles.congratsText}>Parabéns!</Text>
      <Text style={styles.subtitleText}>Você completou o treino!</Text>

      {/* Stats */}
      <Animated.View style={[styles.statsContainer, statsAnimatedStyle]}>
        <View style={styles.divider} />
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.exercisesCompleted}</Text>
            <Text style={styles.statLabel}>Exercícios</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{summary.caloriesBurned}</Text>
            <Text style={styles.statLabel}>Cal</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(summary.totalDuration)}</Text>
            <Text style={styles.statLabel}>Minutos</Text>
          </View>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonsContainer, buttonsAnimatedStyle, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          title="Próximo Treino"
          onPress={handleNextWorkout}
          size="lg"
          style={styles.primaryButton}
        />
        
        <Button
          title="Início"
          onPress={handleGoHome}
          variant="outline"
          size="lg"
          style={styles.secondaryButton}
        />

        {/* Favorite Button */}
        <View style={styles.favoriteRow}>
          <Text style={styles.favoriteText}>
            {isFavorited ? 'Treino nos favoritos' : 'Adicionar aos favoritos'}
          </Text>
          <Button
            title={isFavorited ? 'Favoritado' : 'Favoritar'}
            onPress={handleToggleFavorite}
            variant="ghost"
            size="sm"
            icon={
              <Ionicons 
                name={isFavorited ? 'bookmark' : 'bookmark-outline'} 
                size={20} 
                color={colors.primary[400]} 
              />
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.lg,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  trophyContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  trophy: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  sparkles: {
    position: 'absolute',
    width: 200,
    height: 200,
  },
  sparkle1: {
    position: 'absolute',
    top: 0,
    left: 30,
  },
  sparkle2: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 30,
    right: 10,
  },
  sparkle4: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  congratsText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[400],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    marginBottom: spacing['2xl'],
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border.default,
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.background.card,
  },
  favoriteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  favoriteText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

