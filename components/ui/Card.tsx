/**
 * Card Component
 * Modern card with improved styling inspired by Gofit design
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  neon?: boolean;
  disabled?: boolean;
  completed?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  neon = false,
  disabled = false,
  completed = false,
  style,
  children,
  variant = 'default',
}) => {
  const Container = onPress ? TouchableOpacity : View;

  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.cardElevated;
      case 'outlined':
        return styles.cardOutlined;
      default:
        return styles.card;
    }
  };

  return (
    <Container
      style={[
        getVariantStyle(),
        neon && styles.cardNeon,
        completed && styles.cardCompleted,
        disabled && styles.cardDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.85}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, completed && styles.titleCompleted]}>
            {title}
          </Text>
        )}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {children}
      </View>
      {completed && (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>
      )}
    </Container>
  );
};

/**
 * InfoCard Component
 * Card for displaying stats/info
 */
interface InfoCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  label,
  value,
  icon,
  color = colors.primary[400],
  style,
}) => {
  return (
    <View style={[styles.infoCard, style]}>
      {icon && (
        <View style={[styles.infoIconContainer, { backgroundColor: `${color}20` }]}>
          {icon}
        </View>
      )}
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  cardElevated: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.lg,
  },
  cardOutlined: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardNeon: {
    borderWidth: 1,
    borderColor: colors.primary[500],
    ...shadows.neon,
  },
  cardCompleted: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.success,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  titleCompleted: {
    color: colors.success,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  checkContainer: {
    marginLeft: spacing.sm,
  },

  // Info Card styles
  infoCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  infoValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
