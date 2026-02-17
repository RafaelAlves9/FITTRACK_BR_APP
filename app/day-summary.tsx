import React, { useEffect, useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card } from "@/components";
import { useData } from "@/hooks/useData";
import { executeQuery, STORAGE_KEYS } from "@/services/database";
import { toBrazilDate } from "@/utils/dateUtils";

interface DayData {
   meals: any[];
   water: any | null;
   checks: any[];
}

import { useAuth } from "@/contexts/AuthContext";
import { devError } from "@/utils/logger";

export default function DaySummaryScreen() {
   const insets = useSafeAreaInsets();
   const { date } = useLocalSearchParams<{ date: string }>();
   const { user } = useAuth();
   const [loading, setLoading] = useState(true);
   const [data, setData] = useState<DayData>({
      meals: [],
      water: null,
      checks: [],
   });
   const { workouts } = useData();
   const router = useRouter();
   useEffect(() => {
      loadDayData();
   }, [date]);

   const loadDayData = async () => {
      if (!date || !user?.id) return;
      setLoading(true);
      try {
         // Load meals
         const meals = await executeQuery<any>(
            STORAGE_KEYS.MEALS,
            (m) => m.user_id === user.id && m.date === date,
         );

         // Load water
         const water = await executeQuery<any>(
            STORAGE_KEYS.WATER_INTAKE,
            (w) => w.user_id === user.id && w.date === date,
         );

         // Load checks
         const checks = await executeQuery<any>(
            STORAGE_KEYS.DAILY_CHECKS,
            (c) => c.user_id === user.id && c.date === date,
         );

         setData({
            meals,
            water: water.length > 0 ? water[0] : null,
            checks,
         });
      } catch (error) {
         devError("Error loading day data:", error);
      } finally {
         setLoading(false);
      }
   };

   const formattedDate = date
      ? new Date(date).toLocaleDateString("pt-BR", {
           day: "2-digit",
           month: "long",
           year: "numeric",
        })
      : "";

   // Calculate totals
   const totals = data.meals.reduce(
      (acc, meal) => ({
         calories: acc.calories + (meal.total_calories || 0),
         protein: acc.protein + (meal.total_protein || 0),
         carbs: acc.carbs + (meal.total_carbs || 0),
         fat: acc.fat + (meal.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
   );

   if (loading) {
      return (
         <View style={[globalStyles.container, styles.center]}>
            <ActivityIndicator size="large" color={colors.primary[400]} />
         </View>
      );
   }

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <Stack.Screen options={{ headerShown: false }} />

         <View style={styles.header}>
            <View style={styles.headerTop}>
               <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.text.primary}
                  onPress={() => router.navigate("/")}
               />
               <Text style={styles.title}>Resumo do Dia</Text>
               <View style={{ width: 24 }} />
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
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
               {data.checks.length > 0 ? (
                  <View style={{ gap: spacing.md }}>
                     {data.checks.map((check) => {
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
                  </View>
               ) : (
                  <Text style={styles.emptyText}>
                     Nenhum treino realizado neste dia
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
                        {Math.round(totals.calories)}
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
                        {Math.round(totals.protein)}
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
                        {Math.round(totals.carbs)}
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
                        {Math.round(totals.fat)}
                     </Text>
                     <Text style={styles.nutritionUnit}>g</Text>
                  </View>
               </View>

               <View style={styles.mealsSummary}>
                  <Text style={styles.mealsCount}>
                     {data.meals.length} refeições registradas
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
                  {data.water?.amount_ml || 0} ml
               </Text>
               <View style={styles.waterBar}>
                  <View
                     style={[
                        styles.waterBarFill,
                        {
                           width: `${Math.min(((data.water?.amount_ml || 0) / 2000) * 100, 100)}%`,
                        },
                     ]}
                  />
               </View>
               <Text style={styles.sectionSubtext}>
                  Meta diária: 2000 ml (
                  {Math.round(((data.water?.amount_ml || 0) / 2000) * 100)}%)
               </Text>
            </Card>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   center: {
      justifyContent: "center",
      alignItems: "center",
   },
   header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
   },
   headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
      textAlign: "center",
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
   workoutItem: {
      marginBottom: spacing.xs,
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
});
