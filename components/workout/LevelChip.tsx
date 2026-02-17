/**
 * LevelChip Component
 * Chip for filtering workouts by level
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { WorkoutLevel, WorkoutCategory } from '@/types/workout';

interface LevelChipProps {
  level: WorkoutLevel;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const LevelChip: React.FC<LevelChipProps> = ({
  level,
  label,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * CategoryChip Component
 * Chip for filtering workouts by category
 */
interface CategoryChipProps {
  category: WorkoutCategory;
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  label,
  icon,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={isSelected ? colors.text.primary : colors.text.secondary}
      />
      <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * LevelFilter Component
 * Horizontal scrollable level filter
 */
interface LevelFilterProps {
  selectedLevel: WorkoutLevel | null;
  onSelectLevel: (level: WorkoutLevel | null) => void;
}

export const LevelFilter: React.FC<LevelFilterProps> = ({
  selectedLevel,
  onSelectLevel,
}) => {
  const levels: { value: WorkoutLevel; label: string }[] = [
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' },
  ];

  return (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.chip, selectedLevel === null && styles.chipSelected]}
          onPress={() => onSelectLevel(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, selectedLevel === null && styles.chipTextSelected]}>
            Todos
          </Text>
        </TouchableOpacity>
        {levels.map((level) => (
          <LevelChip
            key={level.value}
            level={level.value}
            label={level.label}
            isSelected={selectedLevel === level.value}
            onPress={() => onSelectLevel(level.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

/**
 * Badge Component
 * Simple badge for displaying info
 */
interface BadgeProps {
  text: string;
  icon?: string;
  variant?: 'default' | 'outline' | 'filled';
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  icon,
  variant = 'outline',
  color = colors.primary[400],
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'filled':
        return [styles.badge, { backgroundColor: color }];
      case 'outline':
        return [styles.badge, styles.badgeOutline, { borderColor: color }];
      default:
        return styles.badge;
    }
  };

  return (
    <View style={getBadgeStyle()}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={12}
          color={variant === 'filled' ? colors.text.primary : color}
        />
      )}
      <Text
        style={[
          styles.badgeText,
          { color: variant === 'filled' ? colors.text.primary : color },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Chip Styles
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.light,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.text.primary,
  },

  // Category Chip Styles
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  categoryChipTextSelected: {
    color: colors.text.primary,
  },

  // Filter Container
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
  },

  // Badge Styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

