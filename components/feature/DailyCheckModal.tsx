import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/hooks/useData';
import { useAlert } from '@/hooks/useAlert';

interface DailyCheckModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DailyCheckModal: React.FC<DailyCheckModalProps> = ({ visible, onClose }) => {
  const { workouts, loading, completeDailyCheck, refreshData } = useData();
  const { showAlert } = useAlert();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) {
      refreshData();
      setSelectedWorkouts([]);
    }
  }, [visible]);

  const toggleWorkoutSelection = (workoutId: string) => {
    setSelectedWorkouts(prevSelected => {
      const isSelected = prevSelected.includes(workoutId);
      if (isSelected) {
        return prevSelected.filter(id => id !== workoutId);
      }
      return [...prevSelected, workoutId];
    });
  };

  const handleConfirm = async () => {
    if (selectedWorkouts.length === 0) return;

    try {
      setConfirming(true);
      await Promise.all(selectedWorkouts.map(id => completeDailyCheck(id)));
      showAlert('Sucesso', 'Daily Check marcado para os treinos selecionados!');
      onClose();
    } catch (error) {
      showAlert('Erro', 'Erro ao marcar um ou mais daily checks');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Daily Check">
      <Text style={styles.subtitle}>Qual treino você fez hoje?</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.emptyText}>Nenhum treino cadastrado</Text>
          <Text style={styles.emptySubtext}>Crie um treino primeiro!</Text>
        </View>
      ) : (
        <View style={styles.workoutList}>
          {workouts.map(workout => (
            <TouchableOpacity
              key={workout.id}
              style={[
                styles.workoutOption,
                selectedWorkouts.includes(workout.id) && styles.workoutOptionSelected,
              ]}
              onPress={() => toggleWorkoutSelection(workout.id)}
            >
              <View style={styles.workoutInfo}>
                <Ionicons 
                  name={workout.type === 'musculacao' ? 'barbell' : 'bicycle'}
                  size={24} 
                  color={selectedWorkouts.includes(workout.id) ? colors.primary[400] : colors.text.secondary} 
                />
                <View style={styles.workoutText}>
                  <Text style={[
                    styles.workoutName,
                    selectedWorkouts.includes(workout.id) && styles.workoutNameSelected,
                  ]}>
                    {workout.name}
                  </Text>
                  <Text style={styles.workoutType}>
                    {workout.type === 'musculacao' ? 'Musculação' : 'Aeróbico'}
                  </Text>
                </View>
              </View>
              {selectedWorkouts.includes(workout.id) && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Cancelar" variant="outline" onPress={onClose} style={styles.button} />
        <Button 
          title="Confirmar" 
          onPress={handleConfirm} 
          disabled={selectedWorkouts.length === 0 || confirming}
          loading={confirming}
          style={styles.button}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  workoutList: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  workoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  workoutOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  workoutText: {
    flex: 1,
  },
  workoutName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  workoutNameSelected: {
    color: colors.primary[400],
  },
  workoutType: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
