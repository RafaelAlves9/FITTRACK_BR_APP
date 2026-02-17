/**
 * Workouts Screen - Main workout listing
 * Displays pre-built workouts organized by level and category
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, workoutLevels } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { WorkoutCard, LevelFilter } from '@/components/workout';
import { 
  PresetWorkout, 
  WorkoutLevel,
  FavoriteWorkout,
} from '@/types/workout';
import {
  getAllPresetWorkouts,
  getFeaturedWorkouts,
  getWorkoutsByLevel,
  getFavoriteWorkouts,
  toggleFavorite,
} from '@/services/presetWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [featuredWorkouts, setFeaturedWorkouts] = useState<PresetWorkout[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<PresetWorkout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<PresetWorkout[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<WorkoutLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [featured, all, userFavorites] = await Promise.all([
        getFeaturedWorkouts(),
        getAllPresetWorkouts(),
        user ? getFavoriteWorkouts(user.id) : Promise.resolve([]),
      ]);
      
      setFeaturedWorkouts(featured);
      setAllWorkouts(all);
      setFilteredWorkouts(all);
      setFavorites(userFavorites.map(f => f.workout_id));
    } catch (error) {
      devError('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter by level
  useEffect(() => {
    const filterWorkouts = async () => {
      if (selectedLevel === null) {
        setFilteredWorkouts(allWorkouts);
      } else {
        const filtered = await getWorkoutsByLevel(selectedLevel);
        setFilteredWorkouts(filtered);
      }
    };
    filterWorkouts();
  }, [selectedLevel, allWorkouts]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (workoutId: string) => {
    if (!user) return;
    
    const isFavorited = await toggleFavorite(user.id, workoutId);
    setFavorites(prev => 
      isFavorited 
        ? [...prev, workoutId]
        : prev.filter(id => id !== workoutId)
    );
  };

  // Navigate to workout detail
  const handleWorkoutPress = (workout: PresetWorkout) => {
    router.push(`/workout-detail?id=${workout.id}`);
  };

  // Render featured workout item
  const renderFeaturedItem = ({ item }: { item: PresetWorkout }) => (
    <WorkoutCard
      workout={item}
      variant="featured"
      onPress={() => handleWorkoutPress(item)}
      onBookmark={() => handleToggleFavorite(item.id)}
      isBookmarked={favorites.includes(item.id)}
    />
  );

  // Render filtered workout item
  const renderFilteredItem = ({ item }: { item: PresetWorkout }) => (
    <View style={styles.compactCardWrapper}>
      <WorkoutCard
        workout={item}
        variant="compact"
        onPress={() => handleWorkoutPress(item)}
        onBookmark={() => handleToggleFavorite(item.id)}
        isBookmarked={favorites.includes(item.id)}
      />
    </View>
  );

  // Render workout by level
  const renderWorkoutsByLevel = (level: WorkoutLevel) => {
    const levelWorkouts = filteredWorkouts.filter(w => w.level === level);
    if (levelWorkouts.length === 0) return null;
    
    const levelConfig = workoutLevels[level];
    
    return (
      <View key={level} style={styles.levelSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{levelConfig.label}</Text>
          <TouchableOpacity onPress={() => setSelectedLevel(level)}>
            <Text style={styles.seeAllText}>Ver Todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {levelWorkouts.slice(0, 5).map(workout => (
            <View key={workout.id} style={styles.compactCardWrapper}>
              <WorkoutCard
                workout={workout}
                variant="compact"
                onPress={() => handleWorkoutPress(workout)}
                onBookmark={() => handleToggleFavorite(workout.id)}
                isBookmarked={favorites.includes(workout.id)}
              />
            </View>
          ))}
        </ScrollView>
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
              <Ionicons name="barbell" size={20} color={colors.text.primary} />
            </View>
            <Text style={styles.logoText}>Treinos</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/workout-favorites')}
          >
            <Ionicons name="bookmark-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
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
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Olá, {user?.email?.split('@')[0] || 'Atleta'} 👋
          </Text>
        </View>

        {/* Featured Workouts */}
        {featuredWorkouts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Treinos em Destaque</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver Todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featuredWorkouts}
              renderItem={renderFeaturedItem}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Level Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Níveis de Treino</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todos</Text>
            </TouchableOpacity>
          </View>
          <LevelFilter
            selectedLevel={selectedLevel}
            onSelectLevel={setSelectedLevel}
          />
        </View>

        {/* Workouts by Level */}
        {selectedLevel === null ? (
          <>
            {renderWorkoutsByLevel('beginner')}
            {renderWorkoutsByLevel('intermediate')}
            {renderWorkoutsByLevel('advanced')}
          </>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {workoutLevels[selectedLevel].label}
              </Text>
              <TouchableOpacity 
                onPress={() => setSelectedLevel(null)}
                style={styles.clearFilter}
              >
                <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                <Text style={styles.clearFilterText}>Limpar filtro</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={filteredWorkouts}
              renderItem={renderFilteredItem}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  greeting: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greetingText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[400],
  },
  featuredList: {
    paddingHorizontal: spacing.lg,
  },
  levelSection: {
    marginBottom: spacing.lg,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  compactCardWrapper: {
    width: 160,
    marginRight: spacing.md,
  },
  clearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearFilterText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
