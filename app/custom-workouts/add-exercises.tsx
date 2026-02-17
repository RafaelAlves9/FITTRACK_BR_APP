/**
 * Add Exercises to Workout Screen
 * Select multiple exercises to add to a workout
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { ExerciseCard } from '@/components/custom-workout';
import { Exercise, ExerciseCategory, ExerciseType } from '@/types/customWorkout';
import { getExercisesGroupedByCategory } from '@/services/exercises';
import { addExercisesToWorkout } from '@/services/customWorkouts';
import { devError } from '@/utils/logger';

export default function AddExercisesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const workoutType = params.type as ExerciseType;
  
  const [exercisesByCategory, setExercisesByCategory] = useState<Record<ExerciseCategory, Exercise[]>>({} as any);
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadExercises = useCallback(async () => {
    try {
      const grouped = await getExercisesGroupedByCategory(workoutType);
      setExercisesByCategory(grouped);
    } catch (error) {
      devError('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  }, [workoutType]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleExercisePress = (exercise: Exercise) => {
    if (multiSelectMode) {
      toggleExerciseSelection(exercise.id);
    } else {
      // Navigate to exercise detail
      router.push(`/custom-workouts/exercise-detail?exerciseId=${exercise.id}`);
    }
  };

  const handleExerciseLongPress = (exercise: Exercise) => {
    setMultiSelectMode(true);
    toggleExerciseSelection(exercise.id);
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleAddExercises = async () => {
    if (selectedExercises.size === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um exercício');
      return;
    }
    
    try {
      setSaving(true);
      await addExercisesToWorkout(workoutId, Array.from(selectedExercises));
      router.back();
    } catch (error) {
      devError('Error adding exercises:', error);
      Alert.alert('Erro', 'Não foi possível adicionar os exercícios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelMultiSelect = () => {
    setMultiSelectMode(false);
    setSelectedExercises(new Set());
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  const categories = Object.keys(exercisesByCategory) as ExerciseCategory[];

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => multiSelectMode ? handleCancelMultiSelect() : router.back()} 
          style={styles.backButton}
        >
          <Ionicons 
            name={multiSelectMode ? "close" : "arrow-back"} 
            size={24} 
            color={colors.text.primary} 
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {multiSelectMode 
            ? `${selectedExercises.size} selecionado(s)` 
            : 'Adicionar Exercícios'
          }
        </Text>
        
        {multiSelectMode && (
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={() => {
              if (selectedExercises.size === 0) {
                // Select all
                const allIds = new Set<string>();
                categories.forEach(cat => {
                  exercisesByCategory[cat]?.forEach(ex => allIds.add(ex.id));
                });
                setSelectedExercises(allIds);
              } else {
                // Deselect all
                setSelectedExercises(new Set());
              }
            }}
          >
            <Text style={styles.selectAllText}>
              {selectedExercises.size === 0 ? 'Todos' : 'Limpar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Instructions */}
        {!multiSelectMode && (
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
            <Text style={styles.instructionsText}>
              Pressione e segure um exercício para selecionar múltiplos
            </Text>
          </View>
        )}

        {/* Exercises by Category */}
        {categories.map(category => {
          const exercises = exercisesByCategory[category] || [];
          if (exercises.length === 0) return null;
          
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{exercises.length}</Text>
                </View>
              </View>
              
              <View style={styles.exercisesGrid}>
                {exercises.map(exercise => (
                  <View key={exercise.id} style={styles.exerciseCardWrapper}>
                    <ExerciseCard
                      exercise={exercise}
                      onPress={() => handleExercisePress(exercise)}
                      onLongPress={() => handleExerciseLongPress(exercise)}
                      isSelected={selectedExercises.has(exercise.id)}
                      variant="compact"
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Add Button */}
      {multiSelectMode && selectedExercises.size > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddExercises}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>
                  Adicionar {selectedExercises.size} exercício(s)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  selectAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  instructionsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  categoryBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  exercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  exerciseCardWrapper: {
    width: '47%',
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

