/**
 * ExerciseCard Component
 * Card for displaying exercise in workout detail
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { WorkoutExercise } from '@/types/workout';

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onPress?: () => void;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onPress,
  isActive = false,
  isCompleted = false,
}) => {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isActive && styles.cardActive,
        isCompleted && styles.cardCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <Image source={{ uri: exercise.imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              isCompleted && styles.titleCompleted,
            ]}
            numberOfLines={1}
          >
            {exercise.name}
          </Text>
          {isCompleted && (
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          )}
        </View>
        
        <Text style={styles.duration}>{formatDuration(exercise.duration)}</Text>
        
        {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
          <View style={styles.muscles}>
            {exercise.targetMuscles.slice(0, 2).map((muscle, idx) => (
              <View key={idx} style={styles.muscleTag}>
                <Text style={styles.muscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {isActive && (
        <View style={styles.playIcon}>
          <Ionicons name="play-circle" size={32} color={colors.primary[400]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * ExerciseListItem Component
 * Simpler list item for exercises
 */
interface ExerciseListItemProps {
  exercise: WorkoutExercise;
  index: number;
  onPress?: () => void;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  index,
  onPress,
}) => {
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View style={styles.listIndex}>
        <Text style={styles.listIndexText}>{index + 1}</Text>
      </View>
      
      <Image source={{ uri: exercise.imageUrl }} style={styles.listImage} />
      
      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.listDuration}>{formatDuration(exercise.duration)}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card Styles
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
  },
  duration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  muscles: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  muscleTag: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  muscleText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  playIcon: {
    marginLeft: spacing.sm,
  },

  // List Item Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  listIndex: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  listIndexText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[400],
  },
  listImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
  },
  listContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  listTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  listDuration: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

