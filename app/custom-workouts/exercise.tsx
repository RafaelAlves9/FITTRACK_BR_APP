/**
 * Exercise Detail Screen (in workout context)
 * View and edit exercise values within a workout
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { WorkoutExerciseItem, ExerciseHistoryEntry } from '@/types/customWorkout';
import { 
  getWorkoutById, 
  updateExerciseInWorkout,
  getExerciseHistory,
} from '@/services/customWorkouts';
import { getExerciseById } from '@/services/exercises';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const exerciseId = params.exerciseId as string;
  
  const [exercise, setExercise] = useState<WorkoutExerciseItem | null>(null);
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form values
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [showHistory, setShowHistory] = useState(false);

  const loadExercise = useCallback(async () => {
    if (!workoutId || !exerciseId || !user) return;
    
    try {
      const workout = await getWorkoutById(workoutId);
      if (!workout) {
        Alert.alert('Erro', 'Treino não encontrado');
        router.back();
        return;
      }
      
      const ex = workout.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex) {
        Alert.alert('Erro', 'Exercício não encontrado no treino');
        router.back();
        return;
      }
      
      setExercise(ex);
      
      // Load form values
      setSets(ex.sets?.toString() || '');
      setReps(ex.reps?.toString() || '');
      setWeight(ex.weight?.toString() || '');
      setDuration(ex.duration?.toString() || '');
      setDistance(ex.distance?.toString() || '');
      
      // Load history
      const hist = await getExerciseHistory(user.id, exerciseId);
      setHistory(hist);
    } catch (error) {
      devError('Error loading exercise:', error);
    } finally {
      setLoading(false);
    }
  }, [workoutId, exerciseId, user]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  const handleSave = async () => {
    if (!exercise) return;
    
    try {
      setSaving(true);
      
      const updates: Partial<WorkoutExerciseItem> = {};
      
      if (exercise.exerciseType === 'musculacao') {
        if (sets) updates.sets = parseInt(sets);
        if (reps) updates.reps = parseInt(reps);
        if (weight) updates.weight = parseFloat(weight);
      } else {
        if (duration) updates.duration = parseInt(duration);
        if (distance) updates.distance = parseFloat(distance);
      }
      
      await updateExerciseInWorkout(workoutId, exerciseId, updates);
      Alert.alert('Sucesso', 'Valores atualizados!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      devError('Error saving exercise:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  };

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

  const isMusculacao = exercise.exerciseType === 'musculacao';

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.exerciseName}
        </Text>
        
        <View style={{ width: 40 }} />
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
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{exercise.category}</Text>
          </View>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores Atuais</Text>
          
          {isMusculacao ? (
            <View style={styles.inputsGrid}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Séries</Text>
                <TextInput
                  style={styles.input}
                  value={sets}
                  onChangeText={setSets}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Repetições</Text>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          ) : (
            <View style={styles.inputsGrid}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Duração (min)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Distância (km)</Text>
                <TextInput
                  style={styles.input}
                  value={distance}
                  onChangeText={setDistance}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          )}
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeaderButton}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>Histórico de Evolução</Text>
            <Ionicons 
              name={showHistory ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.text.secondary} 
            />
          </TouchableOpacity>
          
          {showHistory && (
            <View style={styles.historyList}>
              {history.length === 0 ? (
                <Text style={styles.emptyHistoryText}>
                  Nenhum registro de histórico
                </Text>
              ) : (
                history.map((entry, index) => (
                  <View key={entry.id} style={styles.historyItem}>
                    <View style={styles.historyDate}>
                      <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
                      <Text style={styles.historyDateText}>
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    
                    <View style={styles.historyValues}>
                      {isMusculacao ? (
                        <>
                          {entry.sets && <Text style={styles.historyValue}>{entry.sets} séries</Text>}
                          {entry.reps && <Text style={styles.historyValue}>{entry.reps} reps</Text>}
                          {entry.weight && <Text style={styles.historyValue}>{entry.weight}kg</Text>}
                        </>
                      ) : (
                        <>
                          {entry.duration && <Text style={styles.historyValue}>{entry.duration} min</Text>}
                          {entry.distance && <Text style={styles.historyValue}>{entry.distance} km</Text>}
                        </>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Adicione observações sobre este exercício..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color={colors.white} />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  categoryBadge: {
    alignSelf: 'flex-start',
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
  sectionHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 100,
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyDateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  historyValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  historyValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  emptyHistoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  notesInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

