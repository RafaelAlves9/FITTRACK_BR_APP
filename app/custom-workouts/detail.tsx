/**
 * Custom Workout Detail Screen
 * View and edit workout with exercises
 */

import React, { useState, useEffect, useCallback } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   ActivityIndicator,
   Alert,
   TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { ExerciseCard } from "@/components/custom-workout";
import { CustomWorkout, WorkoutExerciseItem } from "@/types/customWorkout";
import {
   getWorkoutById,
   updateWorkout,
   deleteWorkout,
   removeExerciseFromWorkout,
} from "@/services/customWorkouts";
import { useAuth } from "@/contexts/AuthContext";
import { devError } from "@/utils/logger";

export default function WorkoutDetailScreen() {
   const insets = useSafeAreaInsets();
   const router = useRouter();
   const { user } = useAuth();
   const params = useLocalSearchParams();
   const workoutId = params.id as string;

   const [workout, setWorkout] = useState<CustomWorkout | null>(null);
   const [loading, setLoading] = useState(true);
   const [editing, setEditing] = useState(false);
   const [workoutName, setWorkoutName] = useState("");

   const loadWorkout = useCallback(async () => {
      if (!workoutId) return;

      try {
         const data = await getWorkoutById(workoutId);
         setWorkout(data);
         setWorkoutName(data?.name || "");
      } catch (error) {
         devError("Error loading workout:", error);
      } finally {
         setLoading(false);
      }
   }, [workoutId]);

   useEffect(() => {
      loadWorkout();
   }, [loadWorkout]);

   const handleSaveName = async () => {
      if (!workout || !workoutName.trim()) return;

      try {
         await updateWorkout(workout.id, { name: workoutName.trim() });
         setEditing(false);
         await loadWorkout();
      } catch (error) {
         devError("Error updating workout name:", error);
         Alert.alert("Erro", "Não foi possível atualizar o nome do treino");
      }
   };

   const handleDeleteWorkout = () => {
      Alert.alert(
         "Excluir Treino",
         "Tem certeza que deseja excluir este treino?",
         [
            { text: "Cancelar", style: "cancel" },
            {
               text: "Excluir",
               style: "destructive",
               onPress: async () => {
                  try {
                     await deleteWorkout(workoutId);
                     router.back();
                  } catch (error) {
                     devError("Error deleting workout:", error);
                     Alert.alert("Erro", "Não foi possível excluir o treino");
                  }
               },
            },
         ],
      );
   };

   const handleRemoveExercise = (exerciseId: string) => {
      Alert.alert(
         "Remover Exercício",
         "Deseja remover este exercício do treino?",
         [
            { text: "Cancelar", style: "cancel" },
            {
               text: "Remover",
               style: "destructive",
               onPress: async () => {
                  try {
                     await removeExerciseFromWorkout(workoutId, exerciseId);
                     await loadWorkout();
                  } catch (error) {
                     devError("Error removing exercise:", error);
                     Alert.alert(
                        "Erro",
                        "Não foi possível remover o exercício",
                     );
                  }
               },
            },
         ],
      );
   };

   const handleExercisePress = (exercise: WorkoutExerciseItem) => {
      router.push(
         `/custom-workouts/exercise?workoutId=${workoutId}&exerciseId=${exercise.exerciseId}`,
      );
   };

   const handleAddExercises = () => {
      router.push(
         `/custom-workouts/add-exercises?workoutId=${workoutId}&type=${workout?.type}`,
      );
   };

   if (loading) {
      return (
         <View style={[globalStyles.container, styles.loadingContainer]}>
            <ActivityIndicator size="large" color={colors.primary[400]} />
         </View>
      );
   }

   if (!workout) {
      return (
         <View style={[globalStyles.container, styles.loadingContainer]}>
            <Text style={styles.errorText}>Treino não encontrado</Text>
         </View>
      );
   }

   const iconName = workout.type === "musculacao" ? "barbell" : "bicycle";
   const typeLabel = workout.type === "musculacao" ? "Musculação" : "Aeróbico";

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         {/* Header */}
         <View style={styles.header}>
            <TouchableOpacity
               onPress={() => router.back()}
               style={styles.backButton}
            >
               <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.text.primary}
               />
            </TouchableOpacity>

            <View style={styles.headerActions}>
               <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleDeleteWorkout}
               >
                  <Ionicons
                     name="trash-outline"
                     size={22}
                     color={colors.error}
                  />
               </TouchableOpacity>
            </View>
         </View>

         <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
         >
            {/* Workout Info */}
            <View style={styles.infoCard}>
               <View
                  style={[
                     styles.iconContainer,
                     {
                        backgroundColor:
                           workout.type === "musculacao"
                              ? colors.primary[500]
                              : colors.success[500],
                     },
                  ]}
               >
                  <Ionicons name={iconName} size={32} color={colors.white} />
               </View>

               {editing ? (
                  <View style={styles.nameEditContainer}>
                     <TextInput
                        style={styles.nameInput}
                        value={workoutName}
                        onChangeText={setWorkoutName}
                        placeholder="Nome do treino"
                        placeholderTextColor={colors.text.tertiary}
                        autoFocus
                     />
                     <View style={styles.nameEditActions}>
                        <TouchableOpacity
                           style={styles.nameEditButton}
                           onPress={() => {
                              setWorkoutName(workout.name);
                              setEditing(false);
                           }}
                        >
                           <Text style={styles.nameEditCancelText}>
                              Cancelar
                           </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                           style={[
                              styles.nameEditButton,
                              styles.nameEditSaveButton,
                           ]}
                           onPress={handleSaveName}
                        >
                           <Text style={styles.nameEditSaveText}>Salvar</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               ) : (
                  <View style={styles.nameContainer}>
                     <Text style={styles.workoutName}>{workout.name}</Text>
                     <TouchableOpacity onPress={() => setEditing(true)}>
                        <Ionicons
                           name="pencil"
                           size={20}
                           color={colors.text.secondary}
                        />
                     </TouchableOpacity>
                  </View>
               )}

               <Text style={styles.workoutType}>{typeLabel}</Text>

               <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                     <Ionicons
                        name="list"
                        size={18}
                        color={colors.text.secondary}
                     />
                     <Text style={styles.statText}>
                        {workout.total_exercises || workout.exercises.length}{" "}
                        exercícios
                     </Text>
                  </View>

                  <View style={styles.statItem}>
                     <Ionicons
                        name="flame"
                        size={18}
                        color={colors.error[500]}
                     />
                     <Text style={styles.statText}>
                        {workout.estimated_calories || 0} kcal
                     </Text>
                  </View>
               </View>

               {workout.last_done && (
                  <View style={styles.lastDoneContainer}>
                     <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.text.tertiary}
                     />
                     <Text style={styles.lastDoneText}>
                        Último treino:{" "}
                        {new Date(workout.last_done).toLocaleDateString(
                           "pt-BR",
                        )}
                     </Text>
                  </View>
               )}
            </View>

            {/* Exercises Section */}
            <View style={styles.section}>
               <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Exercícios</Text>
                  <TouchableOpacity
                     style={styles.addButton}
                     onPress={handleAddExercises}
                  >
                     <Ionicons
                        name="add"
                        size={20}
                        color={colors.primary[500]}
                     />
                     <Text style={styles.addButtonText}>Adicionar</Text>
                  </TouchableOpacity>
               </View>

               {workout.exercises.length === 0 ? (
                  <View style={styles.emptyExercises}>
                     <Ionicons
                        name="barbell-outline"
                        size={48}
                        color={colors.text.tertiary}
                     />
                     <Text style={styles.emptyExercisesText}>
                        Nenhum exercício adicionado
                     </Text>
                  </View>
               ) : (
                  workout.exercises.map((exercise, index) => (
                     <View
                        key={`${exercise.exerciseId}-${index}`}
                        style={styles.exerciseItem}
                     >
                        <View style={styles.exerciseNumber}>
                           <Text style={styles.exerciseNumberText}>
                              {index + 1}
                           </Text>
                        </View>
                        <View style={styles.exerciseCardContainer}>
                           <ExerciseCard
                              exercise={exercise}
                              onPress={() => handleExercisePress(exercise)}
                           />
                        </View>
                        <TouchableOpacity
                           style={styles.removeButton}
                           onPress={() =>
                              handleRemoveExercise(exercise.exerciseId)
                           }
                        >
                           <Ionicons
                              name="close-circle"
                              size={24}
                              color={colors.error[500]}
                           />
                        </TouchableOpacity>
                     </View>
                  ))
               )}
            </View>

            {/* Bottom spacing */}
            <View style={{ height: spacing["3xl"] }} />
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
   },
   errorText: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
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
   backButton: {
      padding: spacing.xs,
   },
   headerActions: {
      flexDirection: "row",
      gap: spacing.sm,
   },
   headerButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: colors.background.secondary, // fundo cinza
      alignItems: "center",
      justifyContent: "center",
   },
   content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
   },
   infoCard: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border.default,
      gap: spacing.sm,
   },
   iconContainer: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
   },
   nameContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
   },
   workoutName: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      textAlign: "center",
   },
   nameEditContainer: {
      gap: spacing.sm,
   },
   nameInput: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      textAlign: "center",
   },
   nameEditActions: {
      flexDirection: "row",
      gap: spacing.sm,
   },
   nameEditButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center",
      backgroundColor: colors.background.secondary,
   },
   nameEditSaveButton: {
      backgroundColor: colors.primary[500],
   },
   nameEditCancelText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
   },
   nameEditSaveText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
   },
   workoutType: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
      textAlign: "center",
   },
   statsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.lg,
      marginTop: spacing.sm,
   },
   statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
   },
   statText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   lastDoneContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.xs,
   },
   lastDoneText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.tertiary,
   },
   section: {
      marginTop: spacing.lg,
   },
   sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.md,
   },
   sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[100],
   },
   addButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary[600],
   },
   emptyExercises: {
      alignItems: "center",
      paddingVertical: spacing["3xl"],
      gap: spacing.md,
   },
   emptyExercisesText: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   emptyAddButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.primary[500],
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.full,
      marginTop: spacing.sm,
   },
   emptyAddButtonText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
   },
   exerciseItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      marginBottom: spacing.md,
   },
   exerciseNumber: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[100],
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
   },
   exerciseNumberText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[600],
   },
   exerciseCardContainer: {
      flex: 1,
   },
   removeButton: {
      marginTop: spacing.sm,
   },
});
