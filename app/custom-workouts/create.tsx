/**
 * Create Workout Screen
 * Create a new custom workout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { ExerciseType } from '@/types/customWorkout';
import { createWorkout } from '@/services/customWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

export default function CreateWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [workoutName, setWorkoutName] = useState('');
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }
    
    if (!workoutName.trim()) {
      Alert.alert('Atenção', 'Digite um nome para o treino');
      return;
    }
    
    if (!selectedType) {
      Alert.alert('Atenção', 'Selecione o tipo de treino');
      return;
    }
    
    try {
      setCreating(true);
      const workoutId = await createWorkout(user.id, workoutName.trim(), selectedType);
      router.replace(`/custom-workouts/detail?id=${workoutId}`);
    } catch (error) {
      devError('Error creating workout:', error);
      Alert.alert('Erro', 'Não foi possível criar o treino');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Novo Treino</Text>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome do Treino</Text>
          <TextInput
            style={styles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Ex: Treino A - Peito e Tríceps"
            placeholderTextColor={colors.text.tertiary}
            maxLength={50}
          />
          <Text style={styles.helperText}>
            {workoutName.length}/50 caracteres
          </Text>
        </View>

        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Treino</Text>
          
          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'musculacao' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('musculacao')}
          >
            <View style={[
              styles.typeIcon,
              { backgroundColor: selectedType === 'musculacao' 
                ? colors.primary[500] 
                : colors.background.secondary 
              }
            ]}>
              <Ionicons 
                name="barbell" 
                size={32} 
                color={selectedType === 'musculacao' ? colors.white : colors.text.secondary} 
              />
            </View>
            
            <View style={styles.typeInfo}>
              <Text style={[
                styles.typeName,
                selectedType === 'musculacao' && styles.typeNameSelected,
              ]}>
                Musculação
              </Text>
              <Text style={styles.typeDescription}>
                Treino com pesos, séries e repetições
              </Text>
            </View>
            
            {selectedType === 'musculacao' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary[500]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'aerobico' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('aerobico')}
          >
            <View style={[
              styles.typeIcon,
              { backgroundColor: selectedType === 'aerobico' 
                ? colors.success[500] 
                : colors.background.secondary 
              }
            ]}>
              <Ionicons 
                name="bicycle" 
                size={32} 
                color={selectedType === 'aerobico' ? colors.white : colors.text.secondary} 
              />
            </View>
            
            <View style={styles.typeInfo}>
              <Text style={[
                styles.typeName,
                selectedType === 'aerobico' && styles.typeNameSelected,
              ]}>
                Aeróbico
              </Text>
              <Text style={styles.typeDescription}>
                Treino com duração e distância
              </Text>
            </View>
            
            {selectedType === 'aerobico' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.success[500]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary[500]} />
          <Text style={styles.infoText}>
            Após criar o treino, você poderá adicionar exercícios e configurar os valores
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>

      {/* Create Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!workoutName.trim() || !selectedType || creating) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!workoutName.trim() || !selectedType || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="add" size={24} color={colors.white} />
              <Text style={styles.createButtonText}>Criar Treino</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  typeCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  typeName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  typeNameSelected: {
    color: colors.primary[500],
  },
  typeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary[700],
    lineHeight: 20,
  },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  createButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  createButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

