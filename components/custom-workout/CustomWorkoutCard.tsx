/**
 * Custom Workout Card Component
 * Displays a workout card with name, exercise count, and calories
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { CustomWorkout } from '@/types/customWorkout';

interface CustomWorkoutCardProps {
  workout: CustomWorkout;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

export const CustomWorkoutCard: React.FC<CustomWorkoutCardProps> = ({
  workout,
  onPress,
  onLongPress,
  isSelected = false,
}) => {
  const iconName = workout.type === 'musculacao' ? 'barbell' : 'bicycle';
  const typeLabel = workout.type === 'musculacao' ? 'Musculação' : 'Aeróbico';
  
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: workout.type === 'musculacao' 
            ? colors.primary[500] 
            : colors.success[500] 
          }
        ]}>
          <Ionicons name={iconName} size={24} color={colors.white} />
        </View>
        
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {workout.name}
        </Text>
        
        <Text style={styles.type}>{typeLabel}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="list" size={16} color={colors.text.secondary} />
            <Text style={styles.statText}>
              {workout.total_exercises || workout.exercises?.length || 0} exercícios
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Ionicons name="flame" size={16} color={colors.error[500]} />
            <Text style={styles.statText}>
              {workout.estimated_calories || 0} kcal
            </Text>
          </View>
        </View>
        
        {workout.last_done && (
          <View style={styles.lastDone}>
            <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.lastDoneText}>
              Último: {new Date(workout.last_done).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  content: {
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  type: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  lastDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  lastDoneText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

