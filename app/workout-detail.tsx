/**
 * Workout Detail Screen
 * Shows workout details and exercise list
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows, workoutLevels, workoutCategories } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { ExerciseCard, Badge } from '@/components/workout';
import { Button } from '@/components';
import { PresetWorkout } from '@/types/workout';
import { getWorkoutById, isWorkoutFavorited, toggleFavorite } from '@/services/presetWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  // State
  const [workout, setWorkout] = useState<PresetWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // Load workout data
  const loadWorkout = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const workoutData = await getWorkoutById(id);
      setWorkout(workoutData);
      
      if (user && workoutData) {
        const favorited = await isWorkoutFavorited(user.id, workoutData.id);
        setIsFavorited(favorited);
      }
    } catch (error) {
      devError('Error loading workout:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!user || !workout) return;
    
    const newFavorited = await toggleFavorite(user.id, workout.id);
    setIsFavorited(newFavorited);
  };

  // Start workout session
  const handleStartWorkout = () => {
    if (!workout) return;
    router.push(`/workout-session?id=${workout.id}`);
  };

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

  const levelConfig = workoutLevels[workout.level];
  const categoryConfig = workoutCategories[workout.category];

  return (
    <View style={globalStyles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: workout.imageUrl }}
            style={styles.heroImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(15,15,20,1)']}
              style={styles.heroGradient}
            >
              {/* Header */}
              <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity 
                  style={styles.headerButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                  <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={handleToggleFavorite}
                  >
                    <Ionicons 
                      name={isFavorited ? 'bookmark' : 'bookmark-outline'} 
                      size={24} 
                      color={colors.text.primary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image indicators */}
              <View style={styles.indicators}>
                {[0, 1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.indicator,
                      imageIndex === i && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={styles.detailContent}>
          {/* Title */}
          <Text style={styles.title}>{workout.name}</Text>

          {/* Badges */}
          <View style={styles.badges}>
            <Badge 
              text={levelConfig.label} 
              variant="outline" 
              color={levelConfig.color} 
            />
            <Badge 
              text={`${workout.duration} minutos`} 
              icon="time-outline" 
              variant="outline" 
            />
            <Badge 
              text={`${workout.exerciseCount} exercícios`} 
              icon="barbell-outline" 
              variant="outline" 
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Workout Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercícios do Treino</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>

            {/* Exercise List */}
            {workout.exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
              />
            ))}
          </View>

          {/* Description */}
          {workout.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrição</Text>
              <Text style={styles.description}>{workout.description}</Text>
            </View>
          )}

          {/* Estimated Calories */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{workout.estimatedCalories}</Text>
              <Text style={styles.statLabel}>Calorias</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color={colors.primary[400]} />
              <Text style={styles.statValue}>{workout.duration}</Text>
              <Text style={styles.statLabel}>Minutos</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="barbell" size={24} color={colors.success} />
              <Text style={styles.statValue}>{workout.exerciseCount}</Text>
              <Text style={styles.statLabel}>Exercícios</Text>
            </View>
          </View>

          {/* Bottom spacing for button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title="Iniciar Treino"
          onPress={handleStartWorkout}
          size="lg"
          style={styles.startButton}
          icon={<Ionicons name="play" size={24} color={colors.text.primary} />}
        />
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
  content: {
    flex: 1,
  },
  heroContainer: {
    height: 400,
  },
  heroImage: {
    flex: 1,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: colors.primary[500],
  },
  detailContent: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.primary,
    marginTop: -20,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  startButton: {
    width: '100%',
  },
});

