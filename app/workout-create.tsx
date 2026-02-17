import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { Button, Card, AddCustomExerciseModal } from '@/components';
import { useData } from '@/hooks/useData';
import { musculationExercises, aerobicExercises, type Exercise } from '@/constants/exercises';
import { useAlert } from '@/hooks/useAlert';
import { devError } from '@/utils/logger';

type Step = 'type' | 'exercises' | 'name';

interface WorkoutExercise {
  exerciseId: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
}

export default function WorkoutCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWorkout, getCustomExercisesByType, addCustomExercise } = useData();
  const { showAlert } = useAlert();

  const [step, setStep] = useState<Step>('type');
  const [workoutType, setWorkoutType] = useState<'musculacao' | 'aerobico' | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [saving, setSaving] = useState(false);

  const customExercises = workoutType ? getCustomExercisesByType(workoutType) : [];
  const baseExercises = workoutType === 'musculacao' ? musculationExercises : aerobicExercises;
  const exercises = workoutType ? [...customExercises, ...baseExercises] : [];
  const [customModalOpen, setCustomModalOpen] = useState(false);

  const handleSelectType = (type: 'musculacao' | 'aerobico') => {
    setWorkoutType(type);
    setStep('exercises');
  };

  const handleToggleExercise = (exercise: Exercise) => {
    const exists = selectedExercises.find(e => e.exerciseId === exercise.id);
    
    if (exists) {
      setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exercise.id));
    } else {
      const newExercise: WorkoutExercise = {
        exerciseId: exercise.id,
        ...(workoutType === 'musculacao' ? {
          sets: 3,
          reps: 12,
          weight: 0,
        } : {
          duration: 30,
        }),
      };
      setSelectedExercises(prev => [...prev, newExercise]);
    }
  };

  const handleUpdateExercise = (exerciseId: string, field: string, value: number) => {
    setSelectedExercises(prev => prev.map(ex => 
      ex.exerciseId === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleNextToName = () => {
    if (selectedExercises.length === 0) {
      showAlert('Atenção', 'Selecione pelo menos um exercício');
      return;
    }
    setStep('name');
  };

  const handleCreate = async () => {
    if (!workoutName.trim()) {
      showAlert('Atenção', 'Digite um nome para o treino');
      return;
    }

    if (!workoutType) return;

    try {
      setSaving(true);
      await addWorkout({
        name: workoutName.trim(),
        type: workoutType,
        exercises: selectedExercises,
      });
      showAlert('Sucesso', 'Treino criado com sucesso!');
      router.back();
    } catch (error) {
      devError('Error creating workout:', error);
      showAlert('Erro', 'Erro ao criar treino');
    } finally {
      setSaving(false);
    }
  };

  const renderTypeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de Treino</Text>
      <Text style={styles.stepSubtitle}>Escolha o tipo de treino que deseja criar</Text>

      <View style={styles.typeCards}>
        <TouchableOpacity
          style={[styles.typeCard, globalStyles.cardNeon]}
          onPress={() => handleSelectType('musculacao')}
        >
          <Ionicons name="barbell" size={48} color={colors.primary[400]} />
          <Text style={styles.typeCardTitle}>Musculação</Text>
          <Text style={styles.typeCardSubtitle}>Treino com pesos e equipamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeCard, globalStyles.cardNeon]}
          onPress={() => handleSelectType('aerobico')}
        >
          <Ionicons name="bicycle" size={48} color={colors.primary[400]} />
          <Text style={styles.typeCardTitle}>Aeróbico</Text>
          <Text style={styles.typeCardSubtitle}>Cardio e atividades aeróbicas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExercisesStep = () => {
    const selectedIds = selectedExercises.map(e => e.exerciseId);

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Selecione os Exercícios</Text>
        <Text style={styles.stepSubtitle}>
          {selectedExercises.length} exercício(s) selecionado(s)
        </Text>

        <View style={{ marginBottom: spacing.md }}>
          <Button
            title="Adicionar exercício"
            onPress={() => setCustomModalOpen(true)}
          />
        </View>

        <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
          {Object.entries(exercises.reduce((acc, exercise) => {
            const category = exercise.category || 'Outros';
            if (!acc[category]) acc[category] = [];
            acc[category].push(exercise);
            return acc;
          }, {} as Record<string, typeof exercises>)).map(([category, categoryExercises]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryHeader}>{category}</Text>
              {categoryExercises.map(exercise => {
                const isSelected = selectedIds.includes(exercise.id);
                const selectedExercise = selectedExercises.find(e => e.exerciseId === exercise.id);

                return (
                  <Card key={exercise.id} style={styles.exerciseCard}>
                    <TouchableOpacity
                      style={styles.exerciseHeader}
                      onPress={() => handleToggleExercise(exercise)}
                    >
                      <View style={styles.exerciseInfo}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseCategory}>
                          {workoutType === 'musculacao' 
                            ? `${exercise.calories_per_12_reps ?? exercise.caloriesPer12Reps ?? 0} cal/12 reps`
                            : `${exercise.calories_per_hour ?? exercise.caloriesPerHour ?? 0} cal/hora`}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isSelected ? colors.primary[400] : colors.text.tertiary}
                      />
                    </TouchableOpacity>

                    {isSelected && selectedExercise && (
                      <View style={styles.exerciseConfig}>
                        {workoutType === 'musculacao' ? (
                          <>
                            <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Séries:</Text>
                              <TextInput
                                style={styles.configInput}
                                value={String(selectedExercise.sets || 0)}
                                onChangeText={text => handleUpdateExercise(exercise.id, 'sets', parseInt(text) || 0)}
                                keyboardType="number-pad"
                              />
                            </View>
                            <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Repetições:</Text>
                              <TextInput
                                style={styles.configInput}
                                value={String(selectedExercise.reps || 0)}
                                onChangeText={text => handleUpdateExercise(exercise.id, 'reps', parseInt(text) || 0)}
                                keyboardType="number-pad"
                              />
                            </View>
                            <View style={styles.configRow}>
                              <Text style={styles.configLabel}>Peso (kg):</Text>
                              <TextInput
                                style={styles.configInput}
                                value={String(selectedExercise.weight || 0)}
                                onChangeText={text => handleUpdateExercise(exercise.id, 'weight', parseFloat(text) || 0)}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                placeholderTextColor={colors.text.tertiary}
                              />
                            </View>
                          </>
                        ) : (
                          <View style={styles.configRow}>
                            <Text style={styles.configLabel}>Duração (min):</Text>
                            <TextInput
                              style={styles.configInput}
                              value={String(selectedExercise.duration || 0)}
                              onChangeText={text => handleUpdateExercise(exercise.id, 'duration', parseInt(text) || 0)}
                              keyboardType="number-pad"
                            />
                          </View>
                        )}
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <View style={styles.stepActions}>
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => setStep('type')}
            style={styles.actionButton}
          />
          <Button
            title="Próximo"
            onPress={handleNextToName}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Nome do Treino</Text>
      <Text style={styles.stepSubtitle}>Escolha um nome para identificar este treino</Text>

      <View style={styles.nameInput}>
        <TextInput
          style={styles.nameTextInput}
          placeholder="Ex: Treino A - Peito e Tríceps"
          placeholderTextColor={colors.text.tertiary}
          value={workoutName}
          onChangeText={setWorkoutName}
          autoFocus
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumo do Treino</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tipo:</Text>
          <Text style={styles.summaryValue}>
            {workoutType === 'musculacao' ? 'Musculação' : 'Aeróbico'}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Exercícios:</Text>
          <Text style={styles.summaryValue}>{selectedExercises.length}</Text>
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Voltar"
          variant="outline"
          onPress={() => setStep('exercises')}
          style={styles.actionButton}
        />
        <Button
          title="Criar Treino"
          onPress={handleCreate}
          loading={saving}
          style={styles.actionButton}
        />
      </View>
    </View>
  );

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Novo Treino',
          headerStyle: { backgroundColor: colors.background.secondary },
          headerTintColor: colors.text.primary,
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {step === 'type' && renderTypeStep()}
        {step === 'exercises' && renderExercisesStep()}
        {step === 'name' && renderNameStep()}
      </ScrollView>

      <AddCustomExerciseModal
        visible={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        defaultType={workoutType ?? 'musculacao'}
        onSave={async ({ name, type, category }) => {
          await addCustomExercise({ name, type, category });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  typeCards: {
    gap: spacing.md,
  },
  typeCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  typeCardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  typeCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  exercisesList: {
    flex: 1,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    marginBottom: spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  exerciseCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  exerciseConfig: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.sm,
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  configLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  configInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minWidth: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  nameInput: {
    marginBottom: spacing.xl,
  },
  nameTextInput: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  summary: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[400],
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});
