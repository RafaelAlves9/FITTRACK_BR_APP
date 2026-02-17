/**
 * Exercise Detail Screen (standalone)
 * View exercise details without workout context
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { Exercise } from '@/types/customWorkout';
import { getExerciseById } from '@/services/exercises';
import { devError } from '@/utils/logger';

export default function ExerciseDetailStandaloneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const loadExercise = useCallback(async () => {
    if (!exerciseId) return;
    
    try {
      const data = await getExerciseById(exerciseId);
      setExercise(data);
    } catch (error) {
      devError('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Exercício não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise Image/GIF */}
        {exercise.gif_url ? (
          <Image 
            source={{ uri: exercise.gif_url }} 
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : exercise.image_url ? (
          <Image 
            source={{ uri: exercise.image_url }} 
            style={styles.exerciseImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.exerciseImagePlaceholder}>
            <Ionicons name="barbell-outline" size={64} color={colors.text.tertiary} />
          </View>
        )}

        {/* Exercise Info */}
        <View style={styles.infoCard}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{exercise.category}</Text>
            </View>
            
            <View style={[
              styles.typeBadge,
              { backgroundColor: exercise.type === 'musculacao' 
                ? colors.primary[100] 
                : colors.success[100] 
              }
            ]}>
              <Text style={[
                styles.typeText,
                { color: exercise.type === 'musculacao' 
                  ? colors.primary[600] 
                  : colors.success[600] 
                }
              ]}>
                {exercise.type === 'musculacao' ? 'Musculação' : 'Aeróbico'}
              </Text>
            </View>
          </View>
          
          {Boolean(exercise.description) && (
            <Text style={styles.description}>{exercise.description}</Text>
          )}
        </View>

        {/* Target Muscles */}
        {exercise.target_muscles && exercise.target_muscles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Músculos Trabalhados</Text>
            <View style={styles.musclesList}>
              {exercise.target_muscles.map((muscle, index) => (
                <View key={index} style={styles.muscleItem}>
                  <Ionicons name="fitness" size={16} color={colors.primary[500]} />
                  <Text style={styles.muscleText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Default Values */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores Padrão</Text>
          
          {exercise.type === 'musculacao' ? (
            <View style={styles.defaultValues}>
              {Boolean(exercise.default_sets) && (
                <View style={styles.defaultValueItem}>
                  <Text style={styles.defaultValueLabel}>Séries</Text>
                  <Text style={styles.defaultValueText}>{exercise.default_sets}</Text>
                </View>
              )}
              
              {Boolean(exercise.default_reps) && (
                <View style={styles.defaultValueItem}>
                  <Text style={styles.defaultValueLabel}>Repetições</Text>
                  <Text style={styles.defaultValueText}>{exercise.default_reps}</Text>
                </View>
              )}
              
              {Boolean(exercise.default_weight) && (
                <View style={styles.defaultValueItem}>
                  <Text style={styles.defaultValueLabel}>Peso</Text>
                  <Text style={styles.defaultValueText}>{exercise.default_weight}kg</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.defaultValues}>
              {Boolean(exercise.default_duration) && (
                <View style={styles.defaultValueItem}>
                  <Text style={styles.defaultValueLabel}>Duração</Text>
                  <Text style={styles.defaultValueText}>{exercise.default_duration} min</Text>
                </View>
              )}
              
              {Boolean(exercise.calories_per_hour) && (
                <View style={styles.defaultValueItem}>
                  <Text style={styles.defaultValueLabel}>Calorias/hora</Text>
                  <Text style={styles.defaultValueText}>{exercise.calories_per_hour} kcal</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  content: {
    flex: 1,
  },
  exerciseImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background.secondary,
  },
  exerciseImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.sm,
  },
  exerciseName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  typeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  musclesList: {
    gap: spacing.sm,
  },
  muscleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background.secondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  muscleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  defaultValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  defaultValueItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  defaultValueLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  defaultValueText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  spacer: {
    width: 40,
  },
  bottomSpacer: {
    height: spacing['3xl'],
  },
});

