/**
 * WorkoutCard Component
 * Card for displaying preset workout in list
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows, workoutLevels } from '@/constants/theme';
import { PresetWorkout, WorkoutLevel } from '@/types/workout';

interface WorkoutCardProps {
  workout: PresetWorkout;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onBookmark,
  isBookmarked = false,
  variant = 'default',
}) => {
  const levelConfig = workoutLevels[workout.level];

  const renderBadge = (text: string, icon?: string) => (
    <View style={styles.badge}>
      {icon && <Ionicons name={icon as any} size={12} color={colors.primary[400]} />}
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.85}>
        <ImageBackground
          source={{ uri: workout.imageUrl }}
          style={styles.featuredImage}
          imageStyle={styles.featuredImageStyle}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {workout.name}
              </Text>
              <View style={styles.featuredMeta}>
                <Text style={styles.featuredMetaText}>
                  {workout.duration} min
                </Text>
                <View style={styles.metaDivider} />
                <Text style={styles.featuredMetaText}>
                  {levelConfig.label}
                </Text>
              </View>
            </View>
            {onBookmark && (
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.85}>
        <ImageBackground
          source={{ uri: workout.imageUrl }}
          style={styles.compactImage}
          imageStyle={styles.compactImageStyle}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.compactGradient}
          >
            <Text style={styles.compactTitle} numberOfLines={2}>
              {workout.name}
            </Text>
            <View style={styles.compactMeta}>
              <Text style={styles.compactMetaText}>
                {workout.duration} min
              </Text>
              <View style={styles.metaDivider} />
              <Text style={styles.compactMetaText}>
                {levelConfig.label}
              </Text>
            </View>
            {onBookmark && (
              <TouchableOpacity
                style={styles.compactBookmark}
                onPress={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <ImageBackground
        source={{ uri: workout.imageUrl }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.levelBadge, { backgroundColor: levelConfig.color }]}>
              <Text style={styles.levelBadgeText}>{levelConfig.label}</Text>
            </View>
            {onBookmark && (
              <TouchableOpacity
                style={styles.bookmarkButtonSmall}
                onPress={(e) => {
                  e.stopPropagation();
                  onBookmark();
                }}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {workout.name}
            </Text>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.metaText}>{workout.duration} min</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.metaText}>{workout.estimatedCalories} cal</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="barbell-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.metaText}>{workout.exerciseCount}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImageStyle: {
    borderRadius: borderRadius.xl,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  levelBadgeText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  bookmarkButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },

  // Featured Card
  featuredCard: {
    width: 280,
    height: 340,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginRight: spacing.md,
    ...shadows.card,
  },
  featuredImage: {
    flex: 1,
  },
  featuredImageStyle: {
    borderRadius: borderRadius.xl,
  },
  featuredGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  featuredContent: {
    gap: spacing.sm,
  },
  featuredTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 30,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredMetaText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: spacing.sm,
  },
  bookmarkButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Compact Card (for grid)
  compactCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  compactImage: {
    flex: 1,
  },
  compactImageStyle: {
    borderRadius: borderRadius.lg,
  },
  compactGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  compactTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactMetaText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  compactBookmark: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  badgeText: {
    color: colors.primary[400],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

