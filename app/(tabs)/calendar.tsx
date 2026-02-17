import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card } from "@/components";
import { useData } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { executeQuery, STORAGE_KEYS } from "@/services/database";
import { getNutritionGoalsHistory, NutritionGoals } from "@/services/goals"; // Use history service
import { toBrazilDate } from "@/utils/dateUtils";
import { isSameDay, parseISO, startOfDay, endOfDay } from "date-fns";

const { width } = Dimensions.get("window");
// width - (screen padding * 2) - (card padding * 2)
const DAY_WIDTH = (width - spacing.lg * 2 - spacing.md * 2) / 7;

interface DayData {
   date: string;
   hasWorkout: boolean;
   calories: number;
   waterMl: number;
   // Metas instantâneas (snapshots) para aquele dia
   goals: {
       calories: number;
       waterMl: number;
   };
}

const getDaysInMonth = (year: number, month: number): (Date | null)[] => {
   const days: (Date | null)[] = [];
   const firstDay = new Date(year, month, 1);
   const lastDay = new Date(year, month + 1, 0);

   // Add empty days for alignment
   const firstDayOfWeek = firstDay.getDay();
   for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
   }

   // Add all days of the month
   for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
   }

   // Fill remaining days of the last week
   const remaining = 7 - (days.length % 7);
   if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
         days.push(null);
      }
   }

   return days;
};

const formatDate = (date: Date): string | null => {
   try {
      if (!date || isNaN(date.getTime())) return null;
      return toBrazilDate(date);
   } catch (error) {
      return null;
   }
};

export default function CalendarScreen() {
   const router = useRouter();
   const insets = useSafeAreaInsets();
   const { user } = useAuth();
   const { measurements } = useData();
   const [currentDate, setCurrentDate] = useState(new Date());
   const [calendarData, setCalendarData] = useState<Map<string, DayData>>(
      new Map()
   );
   const [dailyCheckDates, setDailyCheckDates] = useState<Set<string>>(
      new Set()
   );

   const monthPrefix = useMemo(() => {
      // prefixo de mês alinhado ao fuso do Brasil (UTC-3)
      return toBrazilDate(currentDate).slice(0, 8);
   }, [currentDate]);

   // Função auxiliar para encontrar a meta vigente em uma data específica
   const findGoalForDate = useCallback((dateStr: string, goalsHistory: NutritionGoals[], defaultWeight: number) => {
       // Data do dia alvo (início do dia para comparação segura)
       const targetDate = new Date(dateStr + "T00:00:00"); 

       // Filtrar goals criados ANTES ou NO DIA da data alvo
       // Ordenar do mais recente para o mais antigo
       const applicableGoal = goalsHistory
           .filter(g => new Date(g.updated_at) <= endOfDay(targetDate))
           .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

       if (applicableGoal) {
           return {
               calories: applicableGoal.daily_calories,
               // @ts-ignore
               waterMl: applicableGoal.water_ml || Math.min(defaultWeight * 40, 4000) 
           };
       }

       // Se não tem histórico para a época, usa fallback padrão baseado no peso ATUAL (melhor estimativa possível)
       return {
           calories: Math.round(defaultWeight * 30),
           waterMl: Math.min(defaultWeight * 40, 4000)
       };
   }, []);

   const getLatestWeightKg = (): number => {
      const weightHistory = (measurements || [])
         .filter((m: any) => m.type === "weight")
         .sort(
            (a: any, b: any) =>
               new Date(b.date).getTime() - new Date(a.date).getTime()
         );
      return weightHistory.length > 0 ? weightHistory[0].value : 70; // fallback
   };

   const loadMonthData = async () => {
      if (!user?.id) return;

      const currentWeight = getLatestWeightKg();

      // 1. Carregar Histórico de Metas
      const goalsHistory = await getNutritionGoalsHistory(user.id);

      // 2. Carregar Checks
      const checks = await executeQuery<any>(
         STORAGE_KEYS.DAILY_CHECKS,
         (c) =>
            c.user_id === user.id &&
            typeof c.date === "string" &&
            c.date.startsWith(monthPrefix)
      );
      setDailyCheckDates(new Set(checks.map((c) => c.date)));

      // 3. Carregar Refeições (Totais por dia)
      const mealsMonth = await executeQuery<any>(
         STORAGE_KEYS.MEALS,
         (m) =>
            m.user_id === user.id &&
            typeof m.date === "string" &&
            m.date.startsWith(monthPrefix)
      );
      const mealsMap = new Map<string, number>();
      mealsMonth.forEach((m) => {
         const d = m.date;
         mealsMap.set(d, (mealsMap.get(d) || 0) + (m.total_calories || 0));
      });

      // 4. Carregar Água (Totais por dia)
      const waters = await executeQuery<any>(
         STORAGE_KEYS.WATER_INTAKE,
         (w) =>
            w.user_id === user.id &&
            typeof w.date === "string" &&
            w.date.startsWith(monthPrefix)
      );
      const waterMap = new Map<string, number>();
      waters.forEach((w) => {
         const d = w.date;
         waterMap.set(d, (waterMap.get(d) || 0) + (w.amount_ml || 0));
      });

      // 5. Construir Mapa de Dados do Dia combinando tudo
      const dataMap = new Map<string, DayData>();
      
      // Itera sobre todos os dias que tem algum dado (refeição ou água)
      const allDates = new Set([...mealsMap.keys(), ...waterMap.keys()]);

      allDates.forEach((date) => {
          // Para cada dia, descobre qual era a meta valendo naquela data
          const historicalGoal = findGoalForDate(date, goalsHistory, currentWeight);
          
          dataMap.set(date, {
             date,
             hasWorkout: false, // preenchido via dailyCheckDates na renderização
             calories: mealsMap.get(date) || 0,
             waterMl: waterMap.get(date) || 0,
             goals: historicalGoal
          });
      });

      setCalendarData(dataMap);
   };

   useEffect(() => {
      loadMonthData();
   }, [user?.id, currentDate, monthPrefix]); // Reload when month changes

   const year = currentDate.getFullYear();
   const month = currentDate.getMonth();
   const days = getDaysInMonth(year, month);
   const monthName = currentDate.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
   });

   const changeMonth = (direction: number) => {
      setCurrentDate(new Date(year, month + direction, 1));
   };

   const renderDay = (date: Date | null, index: number) => {
      if (!date) {
         return <View key={`empty-${index}`} style={styles.dayCell} />;
      }

      const dateStr = formatDate(date);
      if (!dateStr) {
         return <View key={`invalid-${index}`} style={styles.dayCell} />;
      }

      const dayData = calendarData.get(dateStr);
      const todayStr = formatDate(new Date());
      const isToday = todayStr && dateStr === todayStr;
      
      const hasDailyCheck = dailyCheckDates.has(dateStr);
      
      // Valores do dia
      const waterAmount = dayData?.waterMl || 0;
      const dayCalories = dayData?.calories || 0;

      // Metas do dia (ou padrão se não tiver dados registrados naquele dia ainda, 
      // mas se não tem dados, os dots nem aparecem, então ok)
      const dayGoal = dayData?.goals || { calories: 99999, waterMl: 99999 }; 

      const hasWaterGoal = waterAmount > 0 && waterAmount >= dayGoal.waterMl;
      const overCalorieGoal = dayCalories > dayGoal.calories; 

      const allGoalsMet = hasDailyCheck && !overCalorieGoal && hasWaterGoal;

      return (
         <TouchableOpacity
            key={dateStr}
            style={[styles.dayCell, isToday && styles.dayCellToday]}
            onPress={() => {
               router.push({
                  pathname: "/day-summary",
                  params: { date: dateStr }
               });
            }}
         >
            <View style={[styles.dayNumberContainer, isToday && styles.dayNumberContainerToday]}>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
                   {date.getDate()}
                </Text>
            </View>

            <View style={styles.dayIcons}>
               {allGoalsMet ? (
                   // Se bateu treino, água e não estourou dieta (sucesso total)
                  <View style={styles.dotSuccess} />
               ) : (
                  <View style={styles.dotsRow}>
                     {hasDailyCheck && <View style={styles.dotCheck} />}
                     {/* Mostra dot laranja se estourou calorias, ou talvez verde se ficou dentro? 
                         O padrão anterior mostrava ícone se > goal. Vou manter dot laranja para alerta. */}
                     {overCalorieGoal && <View style={styles.dotDietAlert} />}
                     {hasWaterGoal && <View style={styles.dotWater} />}
                  </View>
               )}
            </View>
         </TouchableOpacity>
      );
   };

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <View style={styles.header}>
            <Text style={styles.title}>Calendário</Text>
         </View>

         <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
         >
            <Card style={styles.calendarCard}>
                <View style={styles.headerRow}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color={colors.primary[400]}
                        onPress={() => changeMonth(-1)}
                    />
                    <Text style={styles.monthText}>{monthName}</Text>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={colors.primary[400]}
                        onPress={() => changeMonth(1)}
                    />
                </View>

               <View style={styles.weekHeader}>
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                     <View key={day} style={styles.weekDay}>
                        <Text style={styles.weekDayText}>{day}</Text>
                     </View>
                  ))}
               </View>

               <View style={styles.daysGrid}>
                  {days.map((date, index) => renderDay(date, index))}
               </View>
            </Card>

            {/* Legend */}
            <Card style={styles.legendCard}>
               <Text style={styles.legendTitle}>Legenda</Text>
               <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                     <View style={styles.dotCheck} />
                     <Text style={styles.legendText}>Treino realizado</Text>
                  </View>
                  <View style={styles.legendItem}>
                     <View style={styles.dotDietAlert} />
                     <Text style={styles.legendText}>
                        Calorias acima da meta
                     </Text>
                  </View>
                  <View style={styles.legendItem}>
                     <View style={styles.dotWater} />
                     <Text style={styles.legendText}>Meta de água batida</Text>
                  </View>
                  <View style={styles.legendItem}>
                     <View style={styles.dotSuccess} />
                     <Text style={styles.legendText}>
                        Dia Perfeito (Treino + Água + Dieta OK)
                     </Text>
                  </View>
               </View>
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
   content: {
      padding: spacing.lg,
   },
   headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
   },
   monthText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      textTransform: "capitalize",
   },
   weekHeader: {
      flexDirection: "row",
      marginBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
      paddingBottom: spacing.xs,
   },
   weekDay: {
      width: DAY_WIDTH,
      alignItems: "center",
   },
   weekDayText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.tertiary,
      textTransform: "uppercase",
   },
   calendarCard: {
      marginBottom: spacing.lg,
      padding: spacing.md,
   },
   daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
   },
   dayCell: {
      width: DAY_WIDTH,
      height: DAY_WIDTH * 1.2,
      padding: 2,
      alignItems: "center",
      justifyContent: "flex-start",
   },
   dayCellToday: {
      backgroundColor: "transparent",
   },
   dayNumberContainer: {
       width: 28,
       height: 28,
       borderRadius: 14,
       alignItems: 'center',
       justifyContent: 'center',
       marginBottom: 4,
   },
   dayNumberContainerToday: {
       backgroundColor: colors.primary[500],
   },
   dayNumber: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
   },
   dayNumberToday: {
      color: "#FFFFFF",
      fontWeight: typography.fontWeight.bold,
   },
   dayIcons: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      height: 6, // fixed height for alignment
   },
   dotsRow: {
       flexDirection: 'row',
       gap: 3,
       alignItems: 'center',
   },
   dotSuccess: {
       width: 6,
       height: 6,
       borderRadius: 3,
       backgroundColor: colors.success,
   },
   dotCheck: {
       width: 4,
       height: 4,
       borderRadius: 2,
       backgroundColor: colors.success,
   },
   dotDietAlert: {
       width: 4,
       height: 4,
       borderRadius: 2,
       backgroundColor: colors.secondary[500], // Orange/Warning color usually
   },
   dotWater: {
       width: 4,
       height: 4,
       borderRadius: 2,
       backgroundColor: colors.primary[400], // Blue/Water
   },
   legendCard: {
      backgroundColor: colors.background.elevated,
   },
   legendTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
   },
   legendItems: {
      gap: spacing.sm,
   },
   legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
   },
   legendText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
});
