import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Modal } from '../ui/Modal';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getCustomFoods, deleteCustomFood, type CustomFood } from '@/services/foods';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useAlert } from '@/hooks/useAlert';
import { devError } from '@/utils/logger';

interface ManageFoodsModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
}

export const ManageFoodsModal: React.FC<ManageFoodsModalProps> = ({
  visible,
  onClose,
  userEmail,
}) => {
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<CustomFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<CustomFood | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showAlert } = useAlert();

  const loadFoods = async () => {
    try {
      setLoading(true);
      const customFoods = await getCustomFoods(userEmail);
      setFoods(customFoods);
      setFilteredFoods(customFoods);
    } catch (error) {
      devError('Error loading foods:', error);
      showAlert('Erro', 'Não foi possível carregar os alimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadFoods();
      setSearchQuery('');
    }
  }, [visible]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    }
  }, [searchQuery, foods]);

  const handleDeleteFood = (food: CustomFood) => {
    setSelectedFood(food);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedFood) return;
    
    try {
      setDeleting(true);
      await deleteCustomFood(selectedFood.id);
      await loadFoods(); // Reload the list
      setDeleteModalVisible(false);
      setSelectedFood(null);
      showAlert('Sucesso', 'Alimento excluído com sucesso.');
    } catch (error) {
      devError('Error deleting food:', error);
      showAlert('Erro', 'Não foi possível excluir o alimento.');
    } finally {
      setDeleting(false);
    }
  };

  const renderFood = ({ item }: { item: CustomFood }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <View style={styles.nutritionInfo}>
          <Text style={styles.nutritionText}>
            {Math.round(item.nutrition.calories)} kcal • 
            {Math.round(item.nutrition.protein)}g prot • 
            {Math.round(item.nutrition.carbs)}g carb • 
            {Math.round(item.nutrition.fat)}g gord
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteFood(item)}
      >
        <Ionicons name="close" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={visible} onClose={onClose} title="Gerenciar Alimentos">
        <View style={styles.container}>
          <Text style={styles.subtitle}>
            Alimentos personalizados cadastrados
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimentos..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : filteredFoods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum resultado' : 'Nenhum alimento cadastrado'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Tente buscar por outro termo'
                  : 'Alimentos personalizados aparecerão aqui'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFoods}
              renderItem={renderFood}
              keyExtractor={(item) => item.id}
              style={styles.foodsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedFood(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Alimento"
        message="Tem certeza que deseja excluir este alimento?"
        itemName={selectedFood?.name}
        loading={deleting}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 500,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  foodsList: {
    maxHeight: 300,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  foodCategory: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  nutritionInfo: {
    marginTop: spacing.xs,
  },
  nutritionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.card,
  },
});