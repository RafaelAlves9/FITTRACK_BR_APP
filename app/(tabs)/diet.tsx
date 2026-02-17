import React, { useEffect, useMemo, useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   RefreshControl,
   TextInput,
   ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card, Button } from "@/components";
import { Alert } from "react-native";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { getNutritionGoals, upsertNutritionGoals } from "@/services/goals";
import { DietAIModal } from "@/components/feature/DietAIModal";
import { DietGoalsModal } from "@/components/feature/DietGoalsModal";
import { ManageFoodsModal } from "@/components/feature/ManageFoodsModal";
import { ManageRecipesModal } from "@/components/feature/ManageRecipesModal";

type GoalsState = {
   calories: number;
   protein: number;
   carbs: number;
   fat: number;
};

export default function DietScreen() {
   const insets = useSafeAreaInsets();
   const router = useRouter();
   const { user } = useAuth();
   const { meals, refreshData, measurements, deleteMeal } = useData();
   const [refreshing, setRefreshing] = useState(false);
   const [activeTab, setActiveTab] = useState<"today" | "details">("today");
   const [goals, setGoals] = useState<GoalsState | null>(null);
   const [savingGoals, setSavingGoals] = useState(false);
   const [aiModalVisible, setAiModalVisible] = useState(false);
   const [goalsModalVisible, setGoalsModalVisible] = useState(false);
   const [manageFoodsModalVisible, setManageFoodsModalVisible] = useState(false);
   const [manageRecipesModalVisible, setManageRecipesModalVisible] = useState(false);

   const handleRefresh = async () => {
      setRefreshing(true);
      await refreshData();
      setRefreshing(false);
   };

   // Helpers
   const getLatestWeightKg = (): number => {
      const weightHistory = (measurements || [])
         .filter((m: any) => m.type === "weight")
         .sort(
            (a: any, b: any) =>
               new Date(b.date).getTime() - new Date(a.date).getTime()
         );
      return weightHistory.length > 0 ? weightHistory[0].value : 70; // fallback
   };

   const computeDefaultGoalsFromWeight = (weightKg: number): GoalsState => {
      // Estratégia razoável: 30 kcal/kg; Proteína 2g/kg; Gordura 0.8g/kg; Carbo completa o restante
      const calories = Math.round(weightKg * 30);
      const protein = Math.round(weightKg * 2);
      const fat = Math.round(weightKg * 0.8);
      const caloriesFromProtein = protein * 4;
      const caloriesFromFat = fat * 9;
      const remainingCalories = Math.max(
         calories - (caloriesFromProtein + caloriesFromFat),
         0
      );
      const carbs = Math.round(remainingCalories / 4);
      return { calories, protein, carbs, fat };
   };

   const loadGoals = async () => {
      if (!user?.id) return;
      const existing = await getNutritionGoals(user.id);
      if (existing) {
         setGoals({
            calories: Math.round(existing.daily_calories),
            protein: Math.round(existing.protein_g),
            carbs: Math.round(existing.carbs_g),
            fat: Math.round(existing.fat_g),
         });
         return;
      }
      const defaults = computeDefaultGoalsFromWeight(getLatestWeightKg());
      setGoals(defaults);
   };

   const persistGoals = async (newGoals: GoalsState) => {
      if (!user?.id) return;
      setSavingGoals(true);
      try {
         await upsertNutritionGoals(user.id, {
            daily_calories: newGoals.calories,
            protein_g: newGoals.protein,
            carbs_g: newGoals.carbs,
            fat_g: newGoals.fat,
         });
         setGoals(newGoals);
         setGoalsModalVisible(false);
      } finally {
         setSavingGoals(false);
      }
   };

   useEffect(() => {
      loadGoals();
   }, [user?.id]);

   // Calcular totais do dia
   const todayTotals = meals.reduce(
      (acc, meal) => ({
         calories: acc.calories + (meal.total_calories || 0),
         protein: acc.protein + (meal.total_protein || 0),
         carbs: acc.carbs + (meal.total_carbs || 0),
         fat: acc.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
   );

   const progress = useMemo(() => {
      if (!goals) return null;
      const pct = (value: number, goal: number) =>
         Math.min(Math.round((value / goal) * 100), 999);
      return {
         calories: pct(todayTotals.calories, Math.max(goals.calories, 1)),
         protein: pct(todayTotals.protein, Math.max(goals.protein, 1)),
         carbs: pct(todayTotals.carbs, Math.max(goals.carbs, 1)),
         fat: pct(todayTotals.fat, Math.max(goals.fat, 1)),
      };
   }, [goals, todayTotals]);

   const renderMeal = ({ item }: { item: any }) => (
      <Card>
         <View style={styles.mealHeader}>
            <View>
               <Text style={styles.mealName}>{item.meal_name}</Text>
               <Text style={styles.mealTime}>
                  {new Date(item.created_at).toLocaleTimeString("pt-BR", {
                     hour: "2-digit",
                     minute: "2-digit",
                  })}
               </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
               <View style={styles.mealCalories}>
                  <Text style={styles.caloriesValue}>
                     {Math.round(item.total_calories)}
                  </Text>
                  <Text style={styles.caloriesLabel}>kcal</Text>
               </View>
               <View style={styles.mealActions}>
                  <TouchableOpacity
                     onPress={() =>
                        router.push({
                           pathname: "/meal-create",
                           params: { id: item.id },
                        })
                     }
                     style={styles.actionBtn}
                  >
                     <Ionicons
                        name="create-outline"
                        size={18}
                        color={colors.text.secondary}
                     />
                  </TouchableOpacity>
                  <TouchableOpacity
                     onPress={() => {
                        Alert.alert(
                           "Excluir refeição",
                           "Tem certeza que deseja excluir esta refeição?",
                           [
                              { text: "Cancelar", style: "cancel" },
                              {
                                 text: "Excluir",
                                 style: "destructive",
                                 onPress: async () => {
                                    try {
                                       await deleteMeal(item.id);
                                    } catch (e) {}
                                 },
                              },
                           ]
                        );
                     }}
                     style={styles.actionBtn}
                  >
                     <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.error}
                     />
                  </TouchableOpacity>
               </View>
            </View>
         </View>

         <View style={styles.macros}>
            <View style={styles.macroItem}>
               <Text style={styles.macroValue}>
                  {Math.round(item.total_protein)}g
               </Text>
               <Text style={styles.macroLabel}>Proteína</Text>
            </View>
            <View style={styles.macroItem}>
               <Text style={styles.macroValue}>
                  {Math.round(item.total_carbs)}g
               </Text>
               <Text style={styles.macroLabel}>Carbo</Text>
            </View>
            <View style={styles.macroItem}>
               <Text style={styles.macroValue}>
                  {Math.round(item.total_fat)}g
               </Text>
               <Text style={styles.macroLabel}>Gordura</Text>
            </View>
         </View>

         <Text style={styles.foodCount}>
            {item.foods?.length || 0} alimento(s)
         </Text>
      </Card>
   );

   const renderTodayTab = () => (
      <ScrollView
         contentContainerStyle={styles.tabContent}
         showsVerticalScrollIndicator={false}
      >
         <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo de Hoje</Text>
            <View style={styles.summaryGrid}>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                     {Math.round(todayTotals.calories)}
                  </Text>
                  <Text style={styles.summaryLabel}>Calorias</Text>
                  {progress && (
                     <Text style={styles.summaryPercent}>
                        {progress.calories}% da meta
                     </Text>
                  )}
               </View>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                     {Math.round(todayTotals.protein)}g
                  </Text>
                  <Text style={styles.summaryLabel}>Proteína</Text>
                  {progress && (
                     <Text style={styles.summaryPercent}>
                        {progress.protein}% da meta
                     </Text>
                  )}
               </View>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                     {Math.round(todayTotals.carbs)}g
                  </Text>
                  <Text style={styles.summaryLabel}>Carboidrato</Text>
                  {progress && (
                     <Text style={styles.summaryPercent}>
                        {progress.carbs}% da meta
                     </Text>
                  )}
               </View>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                     {Math.round(todayTotals.fat)}g
                  </Text>
                  <Text style={styles.summaryLabel}>Gordura</Text>
                  {progress && (
                     <Text style={styles.summaryPercent}>
                        {progress.fat}% da meta
                     </Text>
                  )}
               </View>
            </View>
         </Card>

         <Card style={styles.summaryCard}>
            <View style={styles.mealsHeader}>
               <Text style={styles.mealsTitle}>Refeições</Text>
               <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <TouchableOpacity
                     style={styles.manageButton}
                     onPress={() => setAiModalVisible(true)}
                  >
                     <Ionicons name="sparkles" size={18} color={colors.primary[400]} />
                     <Text style={styles.manageButtonText}>IA</Text>
                  </TouchableOpacity>
                  <Button
                     title="Adicionar"
                     onPress={() => router.push("/meal-create")}
                     icon={<Ionicons name="add" size={18} color="#fff" />}
                     style={styles.addButton}
                  />
               </View>
            </View>

            {meals.length > 0 ? (
               <FlatList
                  data={meals}
                  renderItem={renderMeal}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.mealsList}
                  scrollEnabled={false}
               />
            ) : (
               <View style={styles.emptyContainer}>
                  <Ionicons
                     name="restaurant-outline"
                     size={80}
                     color={colors.text.tertiary}
                  />
                  <Text style={styles.emptyTitle}>Nenhuma refeição hoje</Text>
                  <Text style={styles.emptySubtitle}>
                     Adicione sua primeira refeição!
                  </Text>
               </View>
            )}
         </Card>

      </ScrollView>
   );

   const renderDetailsTab = () => (
      <View style={styles.tabContent}>
         <Card style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Macronutrientes Detalhados</Text>

            <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Calorias Totais</Text>
               <Text style={styles.detailValue}>
                  {Math.round(todayTotals.calories)} kcal
               </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.macroDetail}>
               <Text style={styles.macroDetailLabel}>Proteínas</Text>
               <View style={styles.macroDetailBar}>
                  <View
                     style={[
                        styles.macroDetailFill,
                        {
                           width: `${(todayTotals.protein / 200) * 100}%`,
                           backgroundColor: colors.primary[500],
                        },
                     ]}
                  />
               </View>
               <View style={styles.macroDetailInfo}>
                  <Text style={styles.macroDetailValue}>
                     {Math.round(todayTotals.protein)}g
                  </Text>
                  <Text style={styles.macroDetailCalories}>
                     {Math.round(todayTotals.protein * 4)} kcal
                  </Text>
               </View>
            </View>

            <View style={styles.macroDetail}>
               <Text style={styles.macroDetailLabel}>Carboidratos</Text>
               <View style={styles.macroDetailBar}>
                  <View
                     style={[
                        styles.macroDetailFill,
                        {
                           width: `${(todayTotals.carbs / 300) * 100}%`,
                           backgroundColor: colors.secondary[500],
                        },
                     ]}
                  />
               </View>
               <View style={styles.macroDetailInfo}>
                  <Text style={styles.macroDetailValue}>
                     {Math.round(todayTotals.carbs)}g
                  </Text>
                  <Text style={styles.macroDetailCalories}>
                     {Math.round(todayTotals.carbs * 4)} kcal
                  </Text>
               </View>
            </View>

            <View style={styles.macroDetail}>
               <Text style={styles.macroDetailLabel}>Gorduras</Text>
               <View style={styles.macroDetailBar}>
                  <View
                     style={[
                        styles.macroDetailFill,
                        {
                           width: `${(todayTotals.fat / 100) * 100}%`,
                           backgroundColor: colors.accent[500],
                        },
                     ]}
                  />
               </View>
               <View style={styles.macroDetailInfo}>
                  <Text style={styles.macroDetailValue}>
                     {Math.round(todayTotals.fat)}g
                  </Text>
                  <Text style={styles.macroDetailCalories}>
                     {Math.round(todayTotals.fat * 9)} kcal
                  </Text>
               </View>
            </View>
         </Card>

         <Card style={styles.managementCard}>
            <Text style={styles.managementTitle}>Gerenciar Dados</Text>
            <Text style={styles.managementSubtitle}>
               Visualize e gerencie seus alimentos e receitas personalizados
            </Text>
            
            <View style={styles.managementButtons}>
               <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => setManageFoodsModalVisible(true)}
               >
                  <Ionicons name="restaurant" size={20} color={colors.primary[400]} />
                  <Text style={styles.managementButtonText}>Alimentos</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                  style={styles.managementButton}
                  onPress={() => setManageRecipesModalVisible(true)}
               >
                  <Ionicons name="book" size={20} color={colors.primary[400]} />
                  <Text style={styles.managementButtonText}>Receitas</Text>
               </TouchableOpacity>
            </View>
         </Card>

         <Card style={styles.infoCard}>
            <Ionicons
               name="information-circle"
               size={24}
               color={colors.primary[400]}
            />
            <Text style={styles.infoText}>
               A feature de reconhecimento de alimentos por foto estará
               disponível em breve!
            </Text>
         </Card>
      </View>
   );

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <View style={styles.header}>
            <Text style={styles.title}>Dieta</Text>
            <TouchableOpacity
               style={styles.goalsButton}
               onPress={() => setGoalsModalVisible(true)}
            >
               <Ionicons name="flag-outline" size={24} color={colors.primary[400]} />
               <Text style={styles.goalsButtonText}>Metas</Text>
            </TouchableOpacity>
         </View>
         <DietAIModal
            visible={aiModalVisible}
            onClose={() => setAiModalVisible(false)}
            onSuccess={() => setAiModalVisible(false)}
         />
         
         <DietGoalsModal
            visible={goalsModalVisible}
            onClose={() => setGoalsModalVisible(false)}
            goals={goals}
            onSave={persistGoals}
            saving={savingGoals}
         />

         {user?.email && (
            <>
               <ManageFoodsModal
                  visible={manageFoodsModalVisible}
                  onClose={() => setManageFoodsModalVisible(false)}
                  userEmail={user.email}
               />
               
               <ManageRecipesModal
                  visible={manageRecipesModalVisible}
                  onClose={() => setManageRecipesModalVisible(false)}
                  userEmail={user.email}
               />
            </>
         )}

         <View style={styles.tabs}>
            <TouchableOpacity
               style={[styles.tab, activeTab === "today" && styles.tabActive]}
               onPress={() => setActiveTab("today")}
            >
               <Text
                  style={[
                     styles.tabText,
                     activeTab === "today" && styles.tabTextActive,
                  ]}
               >
                  Hoje
               </Text>
            </TouchableOpacity>
            <TouchableOpacity
               style={[styles.tab, activeTab === "details" && styles.tabActive]}
               onPress={() => setActiveTab("details")}
            >
               <Text
                  style={[
                     styles.tabText,
                     activeTab === "details" && styles.tabTextActive,
                  ]}
               >
                  Detalhes
               </Text>
            </TouchableOpacity>
         </View>

         {activeTab === "today" ? renderTodayTab() : renderDetailsTab()}
      </View>
   );
}

const styles = StyleSheet.create({
   header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
   },
   title: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   goalsButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary[200],
      gap: spacing.xs,
   },
   goalsButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[400],
   },
   tabs: {
      flexDirection: "row",
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
   },
   tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
   },
   tabActive: {
      borderBottomColor: colors.primary[500],
   },
   tabText: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   tabTextActive: {
      color: colors.primary[400],
      fontWeight: typography.fontWeight.semibold,
   },
   tabContent: {
      padding: spacing.lg,
   },
   summaryCard: {
      marginBottom: spacing.lg,
   },
   summaryTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
   },
   summaryItem: {
      flex: 1,
      minWidth: "45%",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
   },
   summaryValue: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
   },
   summaryLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
   },
   summaryPercent: {
      fontSize: typography.fontSize.xs,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
   },
   mealsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
   },
   mealsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   addButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
   },
   manageButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary[200],
      gap: spacing.xs,
   },
   manageButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[400],
   },
   mealsList: {
      flexGrow: 1,
   },
   mealCard: {
      marginBottom: spacing.sm,
   },
   mealHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: spacing.md,
   },
   mealName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   mealTime: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
   },
   mealCalories: {
      alignItems: "flex-end",
   },
   caloriesValue: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
   },
   caloriesLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
   },
   macros: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
   macroItem: {
      alignItems: "center",
   },
   macroValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
   },
   macroLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
   },
   foodCount: {
      fontSize: typography.fontSize.sm,
      color: colors.text.tertiary,
      marginTop: spacing.sm,
   },
   mealActions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
   },
   actionBtn: {
      padding: spacing.xs,
   },
   emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing["3xl"],
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
   },
   detailsCard: {
      marginBottom: spacing.lg,
   },
   detailsTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.lg,
   },
   detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
   },
   detailLabel: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   detailValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   separator: {
      height: 1,
      backgroundColor: colors.border.default,
      marginVertical: spacing.md,
   },
   macroDetail: {
      marginBottom: spacing.lg,
   },
   macroDetailLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
   },
   macroDetailBar: {
      height: 8,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.sm,
      overflow: "hidden",
      marginBottom: spacing.sm,
   },
   macroDetailFill: {
      height: "100%",
   },
   macroDetailInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
   },
   macroDetailValue: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   macroDetailCalories: {
      fontSize: typography.fontSize.sm,
      color: colors.text.tertiary,
   },
   managementCard: {
      marginBottom: spacing.lg,
   },
   managementTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   managementSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
   },
   managementButtons: {
      flexDirection: "row",
      gap: spacing.md,
   },
   managementButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary[200],
      gap: spacing.sm,
   },
   managementButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.primary[400],
   },
   infoCard: {
      flexDirection: "row",
      gap: spacing.md,
      alignItems: "center",
      backgroundColor: colors.background.elevated,
   },
   infoText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
   },
});
