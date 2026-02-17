/**
 * Custom Workouts Screen - Main listing
 * Displays user-created workouts organized by type
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { CustomWorkoutCard } from '@/components/custom-workout';
import { CustomWorkout } from '@/types/customWorkout';
import { getUserWorkouts, getWorkoutsByType } from '@/services/customWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

type FilterType = 'all' | 'musculacao' | 'aerobico';

export default function CustomWorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<CustomWorkout[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWorkouts = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await getUserWorkouts(user.id);
      setWorkouts(data);
      applyFilter(data, selectedFilter);
    } catch (error) {
      devError('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedFilter]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts])
  );

  const applyFilter = (data: CustomWorkout[], filter: FilterType) => {
    if (filter === 'all') {
      setFilteredWorkouts(data);
    } else {
      setFilteredWorkouts(data.filter(w => w.type === filter));
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
    applyFilter(workouts, filter);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const handleWorkoutPress = (workout: CustomWorkout) => {
    router.push(`/custom-workouts/detail?id=${workout.id}`);
  };

  const handleCreateWorkout = () => {
    router.push('/custom-workouts/create');
  };

  const renderWorkoutsByType = (type: 'musculacao' | 'aerobico') => {
    const typeWorkouts = workouts.filter(w => w.type === type);
    if (typeWorkouts.length === 0) return null;
    
    const title = type === 'musculacao' ? 'Musculação' : 'Aeróbico';
    const icon = type === 'musculacao' ? 'barbell' : 'bicycle';
    
    return (
      <View key={type} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name={icon} size={20} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{typeWorkouts.length}</Text>
            </View>
          </View>
        </View>
        
        {typeWorkouts.map(workout => (
          <CustomWorkoutCard
            key={workout.id}
            workout={workout}
            onPress={() => handleWorkoutPress(workout)}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="fitness" size={20} color={colors.text.primary} />
            </View>
            <Text style={styles.logoText}>Meus Treinos</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[400]}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="list" size={24} color={colors.primary[400]} />
            <Text style={styles.statValue}>{workouts.length}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={24} color={colors.primary[400]} />
            <Text style={styles.statValue}>
              {workouts.filter(w => w.type === 'musculacao').length}
            </Text>
            <Text style={styles.statLabel}>Musculação</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="bicycle" size={24} color={colors.success[500]} />
            <Text style={styles.statValue}>
              {workouts.filter(w => w.type === 'aerobico').length}
            </Text>
            <Text style={styles.statLabel}>Aeróbico</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'all' && styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'musculacao' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('musculacao')}
          >
            <Ionicons 
              name="barbell" 
              size={16} 
              color={selectedFilter === 'musculacao' ? colors.white : colors.text.secondary} 
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'musculacao' && styles.filterTextActive,
              ]}
            >
              Musculação
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'aerobico' && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange('aerobico')}
          >
            <Ionicons 
              name="bicycle" 
              size={16} 
              color={selectedFilter === 'aerobico' ? colors.white : colors.text.secondary} 
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'aerobico' && styles.filterTextActive,
              ]}
            >
              Aeróbico
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workouts List */}
        {filteredWorkouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Nenhum treino cadastrado</Text>
            <Text style={styles.emptyText}>
              Crie seu primeiro treino personalizado!
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={handleCreateWorkout}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.emptyButtonText}>Criar Treino</Text>
            </TouchableOpacity>
          </View>
        ) : selectedFilter === 'all' ? (
          <>
            {renderWorkoutsByType('musculacao')}
            {renderWorkoutsByType('aerobico')}
          </>
        ) : (
          <View style={styles.section}>
            {filteredWorkouts.map(workout => (
              <CustomWorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => handleWorkoutPress(workout)}
              />
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>

      {/* Floating Action Button */}
      {workouts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

