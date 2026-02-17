import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/hooks/useData';
import { config } from '@/constants/config';
import { devError } from '@/utils/logger';

interface WaterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WaterModal: React.FC<WaterModalProps> = ({ visible, onClose }) => {
  const { todayWater, addWaterIntake, measurements, nutritionGoals, updateNutritionGoals } = useData();
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Goal Modal State
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState('');

  const currentAmount = todayWater?.amount_ml || 0;
  
  // Calcular meta baseada no peso do usuário (35ml por kg, seguindo padrão comum, ou 40ml como estava)
  const weightMeasurements = measurements.filter(m => m.type === 'weight');
  const latestWeight = weightMeasurements.length > 0 ? weightMeasurements[0].value : 70; // Default 70kg
  const calculatedGoal = Math.min(latestWeight * 40, 4000); // Máximo 4L
  
  // Use custom goal if set, otherwise calculated
  const goalAmount = nutritionGoals?.water_ml || calculatedGoal;
  
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

  useEffect(() => {
    if (visible) {
      setEditingGoal(goalAmount.toString());
    }
  }, [visible, goalAmount]);

  const handleQuickAdd = async (amount: number) => {
    setLoading(true);
    try {
      await addWaterIntake(amount);
    } catch (error) {
      devError('Error adding water:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    try {
      await addWaterIntake(amount);
      setCustomAmount('');
    } catch (error) {
      devError('Error adding water:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    const newGoal = parseInt(editingGoal);
    if (!newGoal || newGoal <= 0) return;

    try {
      await updateNutritionGoals({ water_ml: newGoal });
      setGoalModalVisible(false);
    } catch (error) {
      devError('Error updating water goal:', error);
    }
  };

  const handleResetGoal = async () => {
    try {
      // Reset to calculated by setting it to undefined or explicitly the calculated value
      // Since our update is partial, sending undefined might not clear it in SQL if we don't handle it.
      // But for now let's just set it to calculatedGoal explicitly.
      await updateNutritionGoals({ water_ml: calculatedGoal });
      setGoalModalVisible(false);
    } catch (error) {
      devError('Error resetting water goal:', error);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Água">
      <View style={styles.progressContainer}>
        <View style={styles.headerActions}>
           <TouchableOpacity 
             style={styles.metaButton} 
             onPress={() => {
               setEditingGoal(goalAmount.toString());
               setGoalModalVisible(true);
             }}
           >
             <Ionicons name="settings-outline" size={16} color={colors.primary[400]} />
             <Text style={styles.metaButtonText}>Meta</Text>
           </TouchableOpacity>
        </View>

        <Ionicons name="water" size={64} color={colors.primary[400]} />
        <Text style={styles.currentAmount}>{currentAmount} ml</Text>
        <Text style={styles.goalAmount}>Meta: {goalAmount} ml</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
      </View>

      <Text style={styles.sectionTitle}>Adicionar rapidamente:</Text>
      <View style={styles.quickAddContainer}>
        {config.water.quickAddAmounts.map(amount => (
          <TouchableOpacity
            key={amount}
            style={styles.quickAddButton}
            onPress={() => handleQuickAdd(amount)}
            disabled={loading}
          >
            <Text style={styles.quickAddText}>+{amount}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quantidade personalizada:</Text>
      <View style={styles.customAddContainer}>
        <Input
          placeholder="Ex: 350"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={setCustomAmount}
          style={styles.customInput}
        />
        <Button
          title="Adicionar"
          onPress={handleCustomAdd}
          disabled={!customAmount || loading}
          loading={loading}
          size="sm"
        />
      </View>

      {/* Goal Edit Modal */}
      <Modal 
        visible={goalModalVisible} 
        onClose={() => setGoalModalVisible(false)} 
        title="Definir Meta Diária"
        showCloseButton={true}
      >
        <View style={styles.goalModalContent}>
          <Text style={styles.goalModalDescription}>
            Sua meta calculada é de {calculatedGoal}ml baseada no seu peso.
          </Text>
          
          <Input
            label="Meta Diária (ml)"
            value={editingGoal}
            onChangeText={setEditingGoal}
            keyboardType="numeric"
            placeholder="Ex: 3000"
          />

          <View style={styles.goalModalButtons}>
            <Button 
              title="Usar Recomendado" 
              variant="outline" 
              onPress={handleResetGoal}
              style={{ marginBottom: spacing.sm }}
            />
            <Button 
              title="Salvar" 
              onPress={handleSaveGoal} 
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    position: 'relative',
  },
  headerActions: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  metaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  metaButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  currentAmount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[400],
    marginTop: spacing.md,
  },
  goalAmount: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  progressBar: {
    width: '80%',
    height: 12,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  percentage: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickAddContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  quickAddText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  customAddContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  customInput: {
    flex: 1,
  },
  goalModalContent: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  goalModalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  goalModalButtons: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
