import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card } from "@/components";
import { useData } from "@/hooks/useData";

export default function SummaryScreen() {
   const insets = useSafeAreaInsets();
   const {
      todayChecks,
      todayWater,
      meals,
      measurements,
      workouts,
      nutritionGoals,
   } = useData();

   // Calcular totais do dia
   const todayTotals = meals.reduce(
      (acc, meal) => ({
         calories: acc.calories + (meal.total_calories || 0),
         protein: acc.protein + (meal.total_protein || 0),
         carbs: acc.carbs + (meal.total_carbs || 0),
         fat: acc.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
   );

   // Última medida de peso
   const weightHistory = measurements
      .filter((m) => m.type === "weight")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
   const latestWeight =
      weightHistory.length > 0 ? weightHistory[0].value : null;
   const previousWeight =
      weightHistory.length > 1 ? weightHistory[1].value : null;
   const weightChange =
      latestWeight && previousWeight ? latestWeight - previousWeight : null;

   const calculatedGoal = Math.min((latestWeight || 0) * 40, 4000); // Máximo 4L
   const waterGoal = nutritionGoals?.water_ml || calculatedGoal;

   const hasLoadIncrease = false;

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <View style={styles.header}>
            <Text style={styles.title}>Resumo do Dia</Text>
            <Text style={styles.date}>
               {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
               })}
            </Text>
         </View>

         <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
         >
            {/* Treino */}
            <Card style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <Ionicons
                     name="barbell"
                     size={24}
                     color={colors.primary[400]}
                  />
                  <Text style={styles.sectionTitle}>Treino</Text>
               </View>
               {todayChecks.length > 0 ? (
                  <View style={{ gap: spacing.md }}>
                     {todayChecks.map((check) => {
                        const workout = workouts.find(
                           (w) => w.id === check.workout_id,
                        );
                        if (!workout) return null;
                        return (
                           <View key={check.id} style={styles.workoutItem}>
                              <Text style={styles.highlightValue}>
                                 {workout.name}
                              </Text>
                              <Text style={styles.sectionSubtext}>
                                 {workout.type === "musculacao"
                                    ? "Musculação"
                                    : "Aeróbico"}{" "}
                                 • {workout.exercises.length} exercícios
                              </Text>
                           </View>
                        );
                     })}
                     {hasLoadIncrease && (
                        <View style={styles.badge}>
                           <Ionicons
                              name="trending-up"
                              size={16}
                              color={colors.success}
                           />
                           <Text style={styles.badgeText}>
                              Carga aumentada!
                           </Text>
                        </View>
                     )}
                  </View>
               ) : (
                  <Text style={styles.emptyText}>
                     Nenhum treino realizado hoje
                  </Text>
               )}
            </Card>

            {/* Nutrição */}
            <Card style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <Ionicons
                     name="restaurant"
                     size={24}
                     color={colors.secondary[500]}
                  />
                  <Text style={styles.sectionTitle}>Nutrição</Text>
               </View>

               <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                     <Text style={styles.nutritionLabel}>Calorias</Text>
                     <Text
                        style={[
                           styles.nutritionValue,
                           { color: colors.secondary[500] },
                        ]}
                     >
                        {Math.round(todayTotals.calories)}
                     </Text>
                     <Text style={styles.nutritionUnit}>kcal</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                     <Text style={styles.nutritionLabel}>Proteína</Text>
                     <Text
                        style={[
                           styles.nutritionValue,
                           { color: colors.primary[400] },
                        ]}
                     >
                        {Math.round(todayTotals.protein)}
                     </Text>
                     <Text style={styles.nutritionUnit}>g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                     <Text style={styles.nutritionLabel}>Carboidratos</Text>
                     <Text
                        style={[
                           styles.nutritionValue,
                           { color: colors.accent[500] },
                        ]}
                     >
                        {Math.round(todayTotals.carbs)}
                     </Text>
                     <Text style={styles.nutritionUnit}>g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                     <Text style={styles.nutritionLabel}>Gorduras</Text>
                     <Text
                        style={[
                           styles.nutritionValue,
                           { color: colors.warning },
                        ]}
                     >
                        {Math.round(todayTotals.fat)}
                     </Text>
                     <Text style={styles.nutritionUnit}>g</Text>
                  </View>
               </View>

               <View style={styles.mealsSummary}>
                  <Text style={styles.mealsCount}>
                     {meals.length} refeições registradas
                  </Text>
               </View>
            </Card>

            {/* Hidratação */}
            <Card style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <Ionicons
                     name="water"
                     size={24}
                     color={colors.primary[400]}
                  />
                  <Text style={styles.sectionTitle}>Hidratação</Text>
               </View>
               <Text style={styles.highlightValue}>
                  {todayWater?.amount_ml || 0} ml
               </Text>
               <View style={styles.waterBar}>
                  <View
                     style={[
                        styles.waterBarFill,
                        {
                           width: `${Math.min(((todayWater?.amount_ml || 0) / (nutritionGoals?.water_ml || calculatedGoal)) * 100, 100)}%`,
                        },
                     ]}
                  />
               </View>
               <Text style={styles.sectionSubtext}>
                  Meta diária: {waterGoal} ml (
                  {Math.round(((todayWater?.amount_ml || 0) / waterGoal) * 100)}
                  %)
               </Text>
            </Card>

            {/* Peso e Medidas */}
            <Card style={styles.sectionCard}>
               <View style={styles.sectionHeader}>
                  <Ionicons name="scale" size={24} color={colors.accent[500]} />
                  <Text style={styles.sectionTitle}>Peso</Text>
               </View>
               {latestWeight ? (
                  <>
                     <Text style={styles.highlightValue}>
                        {latestWeight} kg
                     </Text>
                     {weightChange !== null && (
                        <View
                           style={[
                              styles.badge,
                              weightChange < 0
                                 ? styles.badgeSuccess
                                 : styles.badgeWarning,
                           ]}
                        >
                           <Ionicons
                              name={
                                 weightChange < 0
                                    ? "trending-down"
                                    : "trending-up"
                              }
                              size={16}
                              color={
                                 weightChange < 0
                                    ? colors.success
                                    : colors.warning
                              }
                           />
                           <Text
                              style={[
                                 styles.badgeText,
                                 weightChange < 0
                                    ? styles.badgeTextSuccess
                                    : styles.badgeTextWarning,
                              ]}
                           >
                              {weightChange > 0 ? "+" : ""}
                              {weightChange.toFixed(1)} kg
                           </Text>
                        </View>
                     )}
                  </>
               ) : (
                  <Text style={styles.emptyText}>Nenhum peso registrado</Text>
               )}
            </Card>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   header: {
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
   date: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textTransform: "capitalize",
   },
   content: {
      padding: spacing.lg,
   },
   sectionCard: {
      marginBottom: spacing.md,
   },
   sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
   },
   sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   highlightValue: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
      marginBottom: spacing.xs,
   },
   sectionSubtext: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   emptyText: {
      fontSize: typography.fontSize.base,
      color: colors.text.tertiary,
      fontStyle: "italic",
   },
   badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.sm,
      alignSelf: "flex-start",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.sm,
   },
   badgeSuccess: {
      backgroundColor: colors.success + "20",
   },
   badgeWarning: {
      backgroundColor: colors.warning + "20",
   },
   badgeText: {
      fontSize: typography.fontSize.sm,
      color: colors.success,
      fontWeight: typography.fontWeight.semibold,
   },
   badgeTextSuccess: {
      color: colors.success,
   },
   badgeTextWarning: {
      color: colors.warning,
   },
   nutritionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.md,
   },
   nutritionItem: {
      flex: 1,
      minWidth: "45%",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
   },
   nutritionLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
   },
   nutritionValue: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
   },
   nutritionUnit: {
      fontSize: typography.fontSize.sm,
      color: colors.text.tertiary,
   },
   mealsSummary: {
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
   mealsCount: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: "center",
   },
   waterBar: {
      height: 8,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.sm,
      overflow: "hidden",
      marginVertical: spacing.sm,
   },
   waterBarFill: {
      height: "100%",
      backgroundColor: colors.primary[500],
   },
   statsCard: {
      backgroundColor: colors.background.elevated,
   },
   statsTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   statsList: {
      gap: spacing.sm,
   },
   statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
   },
   statLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   statValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
   },
   workoutItem: {
      marginBottom: spacing.xs,
   },
});
