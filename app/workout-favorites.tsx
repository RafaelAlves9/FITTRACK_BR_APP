/**
 * Workout Favorites Screen
 * Shows user's bookmarked workouts
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { WorkoutCard } from '@/components/workout';
import { Modal, Button } from '@/components';
import { PresetWorkout, FavoriteWorkout } from '@/types/workout';
import { 
  getFavoriteWorkouts, 
  getWorkoutById, 
  removeFromFavorites,
} from '@/services/presetWorkouts';
import { useAuth } from '@/contexts/AuthContext';
import { devError } from '@/utils/logger';

export default function WorkoutFavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [favorites, setFavorites] = useState<FavoriteWorkout[]>([]);
  const [workouts, setWorkouts] = useState<PresetWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWorkout, setSelectedWorkout] = useState<PresetWorkout | null>(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userFavorites = await getFavoriteWorkouts(user.id);
      setFavorites(userFavorites);
      
      // Load workout details for each favorite
      const workoutPromises = userFavorites.map(f => getWorkoutById(f.workout_id));
      const workoutResults = await Promise.all(workoutPromises);
      setWorkouts(workoutResults.filter((w): w is PresetWorkout => w !== null));
    } catch (error) {
      devError('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Handle remove from favorites
  const handleRemoveFavorite = (workout: PresetWorkout) => {
    setSelectedWorkout(workout);
    setConfirmModalVisible(true);
  };

  // Confirm remove
  const confirmRemove = async () => {
    if (!user || !selectedWorkout) return;
    
    try {
      await removeFromFavorites(user.id, selectedWorkout.id);
      setWorkouts(prev => prev.filter(w => w.id !== selectedWorkout.id));
      setFavorites(prev => prev.filter(f => f.workout_id !== selectedWorkout.id));
    } catch (error) {
      devError('Error removing favorite:', error);
    } finally {
      setConfirmModalVisible(false);
      setSelectedWorkout(null);
    }
  };

  // Navigate to workout detail
  const handleWorkoutPress = (workout: PresetWorkout) => {
    router.push(`/workout-detail?id=${workout.id}`);
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
          <Text style={styles.title}>Meus Favoritos</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={viewMode === 'list' ? colors.primary[400] : colors.text.secondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons 
              name="grid" 
              size={20} 
              color={viewMode === 'grid' ? colors.primary[400] : colors.text.secondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[400]}
          />
        }
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={80} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Nenhum favorito</Text>
            <Text style={styles.emptySubtitle}>
              Adicione treinos aos favoritos para acessá-los rapidamente
            </Text>
            <Button
              title="Explorar Treinos"
              onPress={() => router.push('/(tabs)/workouts')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <View style={viewMode === 'grid' ? styles.grid : styles.list}>
            {workouts.map(workout => (
              <View 
                key={workout.id} 
                style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
              >
                <WorkoutCard
                  workout={workout}
                  variant={viewMode === 'grid' ? 'compact' : 'default'}
                  onPress={() => handleWorkoutPress(workout)}
                  onBookmark={() => handleRemoveFavorite(workout)}
                  isBookmarked={true}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Confirm Remove Modal */}
      <Modal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        title="Remover dos Favoritos?"
      >
        <View style={styles.modalContent}>
          {selectedWorkout && (
            <View style={styles.modalWorkoutPreview}>
              <WorkoutCard
                workout={selectedWorkout}
                variant="default"
                onPress={() => {}}
                isBookmarked={true}
              />
            </View>
          )}
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setConfirmModalVisible(false)}
              style={styles.modalButton}
            />
            <Button
              title="Sim, Remover"
              onPress={confirmRemove}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonActive: {
    backgroundColor: colors.background.elevated,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '48%',
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    width: '100%',
  },
  modalContent: {
    padding: spacing.md,
  },
  modalWorkoutPreview: {
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

