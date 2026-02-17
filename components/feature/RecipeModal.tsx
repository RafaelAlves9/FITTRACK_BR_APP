import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   Modal,
   TouchableOpacity,
   ScrollView,
   ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { Button } from "@/components";
import { useAlert } from "@/hooks/useAlert";
import {
   getRecipes,
   incrementRecipeUsage,
   type Recipe,
} from "@/services/recipes";
import { useAuth } from "@/contexts/AuthContext";
import { devError } from "@/utils/logger";

interface RecipeModalProps {
   visible: boolean;
   onClose: () => void;
   onSelectRecipe: (recipe: Recipe) => void;
}

export function RecipeModal({
   visible,
   onClose,
   onSelectRecipe,
}: RecipeModalProps) {
   const { user } = useAuth();
   const { showAlert } = useAlert();

   const [recipes, setRecipes] = useState<Recipe[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (visible && user?.email) {
         loadRecipes();
      }
   }, [visible, user]);

   const loadRecipes = async () => {
      if (!user?.email) return;

      try {
         setLoading(true);
         const data = await getRecipes(user.email);
         setRecipes(data);
      } catch (error) {
         devError("Error loading recipes:", error);
         showAlert("Erro", "Falha ao carregar receitas");
      } finally {
         setLoading(false);
      }
   };

   const handleSelectRecipe = async (recipe: Recipe) => {
      try {
         await incrementRecipeUsage(recipe.id);
         onSelectRecipe(recipe);
         onClose();
      } catch (error) {
         devError("Error selecting recipe:", error);
         showAlert("Erro", "Falha ao selecionar receita");
      }
   };

   return (
      <Modal
         visible={visible}
         transparent
         animationType="slide"
         onRequestClose={onClose}
      >
         <View style={styles.overlay}>
            <View style={styles.container}>
               <View style={styles.header}>
                  <Text style={styles.title}>Escolher Receita</Text>
                  <TouchableOpacity onPress={onClose}>
                     <Ionicons
                        name="close"
                        size={24}
                        color={colors.text.primary}
                     />
                  </TouchableOpacity>
               </View>

               {loading ? (
                  <View style={styles.loadingContainer}>
                     <ActivityIndicator
                        size="large"
                        color={colors.primary[400]}
                     />
                  </View>
               ) : recipes.length === 0 ? (
                  <View style={styles.emptyContainer}>
                     <Ionicons
                        name="restaurant-outline"
                        size={64}
                        color={colors.text.tertiary}
                     />
                     <Text style={styles.emptyTitle}>
                        Nenhuma receita salva
                     </Text>
                     <Text style={styles.emptyText}>
                        Ao cadastrar uma refeição, você pode salvá-la como
                        receita para reutilizar depois.
                     </Text>
                  </View>
               ) : (
                  <ScrollView
                     style={styles.content}
                     showsVerticalScrollIndicator={false}
                  >
                     {recipes.map((recipe) => (
                        <TouchableOpacity
                           key={recipe.id}
                           style={styles.recipeItem}
                           onPress={() => handleSelectRecipe(recipe)}
                        >
                           <View style={styles.recipeInfo}>
                              <Text style={styles.recipeName}>
                                 {recipe.name}
                              </Text>
                              <Text style={styles.recipeDetails}>
                                 {recipe.foods.length} alimento(s) •{" "}
                                 {Math.round(recipe.total_calories)} kcal
                              </Text>
                              <Text style={styles.recipeUsage}>
                                 Usado {recipe.times_used}x
                              </Text>
                           </View>
                           <Ionicons
                              name="chevron-forward"
                              size={24}
                              color={colors.primary[400]}
                           />
                        </TouchableOpacity>
                     ))}
                  </ScrollView>
               )}

               <View style={styles.footer}>
                  <Button title="Fechar" onPress={onClose} variant="outline" />
               </View>
            </View>
         </View>
      </Modal>
   );
}

const styles = StyleSheet.create({
   overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
   },
   container: {
      backgroundColor: colors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: "80%",
   },
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
   },
   title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   loadingContainer: {
      padding: spacing["2xl"],
      alignItems: "center",
      justifyContent: "center",
   },
   emptyContainer: {
      padding: spacing["2xl"],
      alignItems: "center",
      justifyContent: "center",
   },
   emptyTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
   },
   emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: 20,
   },
   content: {
      padding: spacing.lg,
   },
   recipeItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
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
   recipeDetails: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
   },
   recipeUsage: {
      fontSize: typography.fontSize.xs,
      color: colors.primary[400],
   },
   footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
});
