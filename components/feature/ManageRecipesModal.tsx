import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Modal } from '../ui/Modal';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getRecipes, deleteRecipe, type Recipe } from '@/services/recipes';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useAlert } from '@/hooks/useAlert';
import { devError } from '@/utils/logger';

interface ManageRecipesModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
}

export const ManageRecipesModal: React.FC<ManageRecipesModalProps> = ({
  visible,
  onClose,
  userEmail,
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showAlert } = useAlert();

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const userRecipes = await getRecipes(userEmail);
      setRecipes(userRecipes);
      setFilteredRecipes(userRecipes);
    } catch (error) {
      devError('Error loading recipes:', error);
      showAlert('Erro', 'Não foi possível carregar as receitas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadRecipes();
      setSearchQuery('');
    }
  }, [visible]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  const handleDeleteRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecipe) return;
    
    try {
      setDeleting(true);
      await deleteRecipe(selectedRecipe.id);
      await loadRecipes(); // Reload the list
      setDeleteModalVisible(false);
      setSelectedRecipe(null);
      showAlert('Sucesso', 'Receita excluída com sucesso.');
    } catch (error) {
      devError('Error deleting recipe:', error);
      showAlert('Erro', 'Não foi possível excluir a receita.');
    } finally {
      setDeleting(false);
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeItem}>
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeUsage}>
          Usada {item.times_used} {item.times_used === 1 ? 'vez' : 'vezes'}
        </Text>
        <View style={styles.nutritionInfo}>
          <Text style={styles.nutritionText}>
            {Math.round(item.total_calories)} kcal • 
            {Math.round(item.total_protein)}g prot • 
            {Math.round(item.total_carbs)}g carb • 
            {Math.round(item.total_fat)}g gord
          </Text>
        </View>
        <Text style={styles.foodsCount}>
          {item.foods.length} {item.foods.length === 1 ? 'alimento' : 'alimentos'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRecipe(item)}
      >
        <Ionicons name="close" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Modal visible={visible} onClose={onClose} title="Gerenciar Receitas">
        <View style={styles.container}>
          <Text style={styles.subtitle}>
            Receitas salvas e sua frequência de uso
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receitas..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="book-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Nenhum resultado' : 'Nenhuma receita salva'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Tente buscar por outro termo'
                  : 'Receitas salvas aparecerão aqui'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecipes}
              renderItem={renderRecipe}
              keyExtractor={(item) => item.id}
              style={styles.recipesList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setSelectedRecipe(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Receita"
        message="Tem certeza que deseja excluir esta receita?"
        itemName={selectedRecipe?.name}
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
  recipesList: {
    maxHeight: 300,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recipeUsage: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[400],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  nutritionInfo: {
    marginTop: spacing.xs,
  },
  nutritionText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  foodsCount: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background.card,
  },
});