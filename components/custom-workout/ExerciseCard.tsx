/**
 * Exercise Card Component
 * Displays an exercise card with name, volume info, and image
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { WorkoutExerciseItem, Exercise } from '@/types/customWorkout';

interface ExerciseCardProps {
  exercise: WorkoutExerciseItem | Exercise;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  variant?: 'default' | 'compact';
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  onLongPress,
  isSelected = false,
  variant = 'default',
}) => {
  const isWorkoutExercise = 'exerciseId' in exercise;
  const name = isWorkoutExercise ? exercise.exerciseName : exercise.name;
  const imageUrl = isWorkoutExercise ? exercise.image_url : exercise.image_url;
  const category = exercise.category;
  
  // Format volume info
  const getVolumeInfo = () => {
    if (!isWorkoutExercise) return null;
    
    const ex = exercise as WorkoutExerciseItem;
    
    if (ex.exerciseType === 'musculacao') {
      const parts = [];
      if (ex.sets) parts.push(`${ex.sets} séries`);
      if (ex.reps) parts.push(`${ex.reps} reps`);
      if (ex.weight) parts.push(`${ex.weight}kg`);
      return parts.join(' • ');
    } else {
      const parts = [];
      if (ex.duration) parts.push(`${ex.duration} min`);
      if (ex.distance) parts.push(`${ex.distance} km`);
      return parts.join(' • ');
    }
  };
  
  const volumeInfo = getVolumeInfo();
  
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactCard, isSelected && styles.cardSelected]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {imageUrl && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.compactImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.compactCategory}>{category}</Text>
        </View>
        
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary[400]} />
          </View>
        )}
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons 
            name="barbell-outline" 
            size={40} 
            color={colors.text.tertiary} 
          />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        
        <Text style={styles.category}>{category}</Text>
        
        {volumeInfo && (
          <View style={styles.volumeContainer}>
            <Ionicons name="stats-chart" size={14} color={colors.text.secondary} />
            <Text style={styles.volumeText}>{volumeInfo}</Text>
          </View>
        )}
      </View>
      
      {isSelected && (
        <View style={styles.selectedBadgeDefault}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary[400]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background.secondary,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  category: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  volumeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  selectedBadgeDefault: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
  },
  
  // Compact variant
  compactCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    width: 140,
  },
  compactImage: {
    width: '100%',
    height: 80,
    backgroundColor: colors.background.secondary,
  },
  compactContent: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  compactName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  compactCategory: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
  },
});

