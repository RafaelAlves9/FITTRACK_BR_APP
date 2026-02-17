import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface GoalsState {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  goals: GoalsState | null;
  onSave: (goals: GoalsState) => Promise<void>;
  saving?: boolean;
}

export const DietGoalsModal: React.FC<DietGoalsModalProps> = ({
  visible,
  onClose,
  goals,
  onSave,
  saving = false,
}) => {
  const [localGoals, setLocalGoals] = useState<GoalsState>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  });

  useEffect(() => {
    if (goals) {
      setLocalGoals(goals);
    }
  }, [goals]);

  const handleSave = async () => {
    await onSave(localGoals);
  };

  const updateGoal = (field: keyof GoalsState, value: string) => {
    const numValue = Number(value.replace(/[^0-9]/g, '')) || 0;
    setLocalGoals(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Metas de Dieta">
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Configure suas metas diárias de nutrição
        </Text>

        <View style={styles.goalsGrid}>
          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Calorias</Text>
            <TextInput
              keyboardType="numeric"
              value={String(localGoals.calories)}
              onChangeText={(text) => updateGoal('calories', text)}
              style={styles.goalInput}
              placeholder="2000"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.goalUnit}>kcal</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Proteína</Text>
            <TextInput
              keyboardType="numeric"
              value={String(localGoals.protein)}
              onChangeText={(text) => updateGoal('protein', text)}
              style={styles.goalInput}
              placeholder="150"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.goalUnit}>g</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Carboidratos</Text>
            <TextInput
              keyboardType="numeric"
              value={String(localGoals.carbs)}
              onChangeText={(text) => updateGoal('carbs', text)}
              style={styles.goalInput}
              placeholder="250"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.goalUnit}>g</Text>
          </View>

          <View style={styles.goalItem}>
            <Text style={styles.goalLabel}>Gorduras</Text>
            <TextInput
              keyboardType="numeric"
              value={String(localGoals.fat)}
              onChangeText={(text) => updateGoal('fat', text)}
              style={styles.goalInput}
              placeholder="70"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={styles.goalUnit}>g</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
            style={styles.button}
          />
          <Button
            title={saving ? "Salvando..." : "Salvar"}
            onPress={handleSave}
            disabled={saving}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  goalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  goalInput: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingVertical: spacing.xs,
    minWidth: 80,
  },
  goalUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});