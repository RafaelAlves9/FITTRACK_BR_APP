import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   TextInput,
   ActivityIndicator,
   Modal,
   Keyboard,
   Platform,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import {
   Button,
   Card,
   Input,
   AddCustomFoodModal,
   RecipeModal,
} from "@/components";
import { useData } from "@/hooks/useData";
import { Alert } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useAlert } from "@/hooks/useAlert";
import { foodCatalog, type Food } from "@/constants/foods";
import { analyzeMealImage, analyzeMealDescription } from "@/services/abacusAI";
import { addCustomFood, addCustomFoodWithDuplicationCheck } from "@/services/foods";
import { searchAllFoods } from "@/services/foods";
import { useAuth } from "@/contexts/AuthContext";
import { createRecipe, type Recipe } from "@/services/recipes";
import { devLog, devError } from "@/utils/logger";

interface MealFood {
   food: Food;
   grams: number;
   totalNutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
   };
}

export default function MealCreateScreen() {
   const insets = useSafeAreaInsets();
   const router = useRouter();
   const params = useLocalSearchParams();
   const editingMealId = typeof params.id === "string" ? params.id : undefined;
   const { addMeal, updateMeal, deleteMeal, meals } = useData();
   const { isOnline } = useNetworkStatus();
   const { showAlert } = useAlert();
   const { user } = useAuth();

   const [mealName, setMealName] = useState("");
   const [selectedFoods, setSelectedFoods] = useState<MealFood[]>([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [searching, setSearching] = useState(false);
   const [searchResults, setSearchResults] = useState<Food[]>([]);
   const [saving, setSaving] = useState(false);
   const [analyzingImage, setAnalyzingImage] = useState(false);
   const [analyzingText, setAnalyzingText] = useState(false);
   const [showAIOptions, setShowAIOptions] = useState(params?.ai === "1");
   const [aiDescription, setAIDescription] = useState("");
   const shouldAutoClose = params?.onSuccess === "true";
   const isEditing = !!editingMealId;

   // Modal for entering grams
   const [showGramsModal, setShowGramsModal] = useState(false);
   const [selectedFood, setSelectedFood] = useState<Food | null>(null);
   const [gramsInput, setGramsInput] = useState("");

   // Custom food modal
   const [customFoodModalVisible, setCustomFoodModalVisible] = useState(false);

   // Recipe modal & save-as-recipe flag
   const [recipeModalVisible, setRecipeModalVisible] = useState(false);
   const [saveAsRecipe, setSaveAsRecipe] = useState(false);

   // Search across base + custom foods
   const performSearch = useCallback(
      async (query: string) => {
         if (!user?.email) return;
         if (!query.trim()) {
            setSearchResults([]);
            return;
         }
         try {
            setSearching(true);
            const results = await searchAllFoods(user.email, query);
            setSearchResults(results);
         } catch (error: any) {
            devError("Error searching foods:", error);
         } finally {
            setSearching(false);
         }
      },
      [user?.email]
   );

   useEffect(() => {
      performSearch(searchQuery);
   }, [searchQuery, performSearch]);

   // Auto-process AI prompt when coming from AI modal
   useEffect(() => {
      const promptFromParams = typeof params.prompt === "string" ? params.prompt : "";
      if (promptFromParams && showAIOptions && !analyzingText) {
         setAIDescription(promptFromParams);
         // Auto-trigger AI analysis after a short delay
         const timer = setTimeout(async () => {
            try {
               if (!isOnline) return;
               setAnalyzingText(true);
               const detections = await analyzeMealDescription(promptFromParams.trim());
               if (detections && detections.length > 0) {
                  const newFoods = await mapDetectionsToMealFoods(detections as any[]);
                  setSelectedFoods(newFoods);
                  
                  if (shouldAutoClose) {
                     // Auto-save when coming from AI modal
                     const totals = newFoods.reduce(
                        (acc, mealFood) => ({
                           calories: acc.calories + mealFood.totalNutrition.calories,
                           protein: acc.protein + mealFood.totalNutrition.protein,
                           carbs: acc.carbs + mealFood.totalNutrition.carbs,
                           fat: acc.fat + mealFood.totalNutrition.fat,
                        }),
                        { calories: 0, protein: 0, carbs: 0, fat: 0 }
                     );

                     const finalMealName = promptFromParams.trim();
                     setMealName(finalMealName);

                     await addMeal({
                        meal_name: finalMealName,
                        foods: newFoods.map((mf) => ({
                           id: mf.food.id,
                           name: mf.food.name,
                           grams: mf.grams,
                           nutrition: mf.totalNutrition,
                        })),
                        total_calories: totals.calories,
                        total_protein: totals.protein,
                        total_carbs: totals.carbs,
                        total_fat: totals.fat,
                     });

                     router.back();
                  }
               }
            } catch (error) {
               devError("Auto AI analysis error:", error);
            } finally {
               setAnalyzingText(false);
            }
         }, 1000);

         return () => clearTimeout(timer);
      }
   }, [params.prompt, showAIOptions, analyzingText, isOnline, shouldAutoClose, mapDetectionsToMealFoods, addMeal, router]);

   const mapDetectionsToMealFoods = useCallback(
      async (detectedFoods: any[]): Promise<MealFood[]> => {
         const newFoods: MealFood[] = [];
         let duplicatesFound = 0;
         let newFoodsCreated = 0;
         
         for (const detected of detectedFoods) {
            const grams = Math.max(1, Number(detected.estimated_grams) || 0);
            const ratio = grams / 100;
            const per100 = {
               calories: (detected.nutrition?.calories || 0) / (ratio || 1),
               protein: (detected.nutrition?.protein || 0) / (ratio || 1),
               carbs: (detected.nutrition?.carbs || 0) / (ratio || 1),
               fat: (detected.nutrition?.fat || 0) / (ratio || 1),
            };

            // Use the new duplication check function
            const { food, isNew } = await addCustomFoodWithDuplicationCheck(user?.email, {
               name: String(detected.name),
               category: detected.category || "Personalizado",
               serving: { unit: "g", amount: 100 },
               nutrition: per100,
            });

            if (isNew) {
               newFoodsCreated++;
            } else {
               duplicatesFound++;
            }

            newFoods.push({
               food,
               grams,
               totalNutrition: {
                  calories: Number(detected.nutrition?.calories) || 0,
                  protein: Number(detected.nutrition?.protein) || 0,
                  carbs: Number(detected.nutrition?.carbs) || 0,
                  fat: Number(detected.nutrition?.fat) || 0,
               },
            });
         }

         // Show info about duplicates if any were found
         if (duplicatesFound > 0) {
            showAlert(
               'Alimentos Encontrados',
               `${duplicatesFound} alimento(s) já existiam no sistema e foram reutilizados. ${newFoodsCreated} novo(s) alimento(s) foram cadastrados.`
            );
         }
         
         return newFoods;
      },
      [user?.email, showAlert]
   );

   const handleTakePhoto = async () => {
      try {
         devLog("📸 handleTakePhoto called");

         // Check online status first
         if (!isOnline) {
            showAlert(
               "Sem Internet",
               "A câmera com IA requer conexão com a internet."
            );
            return;
         }

         devLog("📸 Requesting camera permissions...");
         const permissionResult =
            await ImagePicker.requestCameraPermissionsAsync();
         devLog("📸 Permission result:", permissionResult);

         if (permissionResult.status !== "granted") {
            showAlert(
               "Permissão Negada",
               "Precisamos de acesso à câmera para identificar alimentos."
            );
            return;
         }

         devLog("📸 Launching camera...");
         const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
         });

         devLog("📸 Camera result:", {
            canceled: result.canceled,
            hasAssets: !!result.assets,
            assetsLength: result.assets?.length,
         });

         if (!result.canceled && result.assets?.[0]?.base64) {
            devLog("📸 Image captured, analyzing...");
            await analyzeImageWithAI(result.assets[0].base64);
         } else {
            devLog("📸 Camera was canceled or no image captured");
         }
      } catch (error: any) {
         devError("❌ Camera error:", error);
         showAlert("Erro", `Falha ao tirar foto: ${error.message}`);
      }
   };

   const handlePickImage = async () => {
      try {
         devLog("🖼️ handlePickImage called");

         // Check online status first
         if (!isOnline) {
            showAlert(
               "Sem Internet",
               "A análise de imagens com IA requer conexão com a internet."
            );
            return;
         }

         devLog("🖼️ Requesting media library permissions...");
         const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
         devLog("🖼️ Permission result:", permissionResult);

         if (permissionResult.status !== "granted") {
            showAlert("Permissão Negada", "Precisamos de acesso à galeria.");
            return;
         }

         devLog("🖼️ Launching image picker...");
         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
            base64: true,
         });

         devLog("🖼️ Picker result:", {
            canceled: result.canceled,
            hasAssets: !!result.assets,
            assetsLength: result.assets?.length,
         });

         if (!result.canceled && result.assets?.[0]?.base64) {
            devLog("🖼️ Image selected, analyzing...");
            await analyzeImageWithAI(result.assets[0].base64);
         } else {
            devLog("🖼️ Picker was canceled or no image selected");
         }
      } catch (error: any) {
         devError("❌ Gallery error:", error);
         showAlert("Erro", `Falha ao selecionar imagem: ${error.message}`);
      }
   };

   const analyzeImageWithAI = async (base64Image: string) => {
      setAnalyzingImage(true);
      devLog("🤖 Starting AI analysis...");

      try {
         const detectedFoods = await analyzeMealImage(base64Image);
         devLog("🤖 AI detected foods:", detectedFoods);

         if (detectedFoods.length === 0) {
            showAlert(
               "Nenhum alimento detectado",
               "Não conseguimos identificar alimentos. Tente outra foto ou adicione manualmente."
            );
            return;
         }

         const newFoods = await mapDetectionsToMealFoods(
            detectedFoods as any[]
         );
         setSelectedFoods((prev) => [...prev, ...newFoods]);

         showAlert(
            "Sucesso!",
            `${detectedFoods.length} alimento(s) identificado(s)! Você pode editar as quantidades.`
         );
      } catch (error: any) {
         devError("❌ AI analysis error:", error);
         showAlert(
            "Erro ao Analisar Imagem",
            error.message ||
               "Falha ao analisar imagem. Você pode adicionar alimentos manualmente."
         );
      } finally {
         setAnalyzingImage(false);
      }
   };

   const handleSendDescription = async () => {
      try {
         if (!isOnline) {
            showAlert(
               "Sem Internet",
               "A análise por texto com IA requer conexão com a internet."
            );
            return;
         }
         if (!aiDescription.trim() || aiDescription.trim().length < 5) {
            showAlert("Atenção", "Descreva a refeição com mais detalhes.");
            return;
         }
         setAnalyzingText(true);
         const detections = await analyzeMealDescription(aiDescription.trim());
         if (!detections || detections.length === 0) {
            showAlert(
               "Nenhum alimento inferido",
               "Não foi possível entender a descrição. Tente ser mais específico."
            );
            return;
         }
         const newFoods = await mapDetectionsToMealFoods(detections as any[]);
         setSelectedFoods((prev) => [...prev, ...newFoods]);
         
         if (shouldAutoClose) {
            // Auto-save when coming from AI modal
            const updatedFoods = [...selectedFoods, ...newFoods];
            const totals = updatedFoods.reduce(
               (acc, mealFood) => ({
                  calories: acc.calories + mealFood.totalNutrition.calories,
                  protein: acc.protein + mealFood.totalNutrition.protein,
                  carbs: acc.carbs + mealFood.totalNutrition.carbs,
                  fat: acc.fat + mealFood.totalNutrition.fat,
               }),
               { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            // Use AI description as meal name if not set
            const finalMealName = mealName.trim() || aiDescription.trim();

            await addMeal({
               meal_name: finalMealName,
               foods: updatedFoods.map((mf) => ({
                  id: mf.food.id,
                  name: mf.food.name,
                  grams: mf.grams,
                  nutrition: mf.totalNutrition,
               })),
               total_calories: totals.calories,
               total_protein: totals.protein,
               total_carbs: totals.carbs,
               total_fat: totals.fat,
            });

            router.back();
         } else {
            showAlert(
               "Sucesso!",
               `${detections.length} alimento(s) identificado(s) na descrição!`
            );
         }
      } catch (error: any) {
         devError("❌ AI text analysis error:", error);
         showAlert(
            "Erro ao Analisar Descrição",
            error.message || "Falha ao analisar a descrição."
         );
      } finally {
         setAnalyzingText(false);
      }
   };

   const handleSelectFood = (food: Food) => {
      setSelectedFood(food);
      setGramsInput("100"); // Default 100g
      setShowGramsModal(true);
   };

   const handleConfirmGrams = () => {
      if (!selectedFood) return;

      const grams = parseFloat(gramsInput);
      if (isNaN(grams) || grams <= 0) {
         showAlert("Atenção", "Digite uma quantidade válida em gramas");
         return;
      }

      // Calculate nutrition based on grams (catalog is per 100g)
      const gramsRatio = grams / 100;
      const mealFood: MealFood = {
         food: selectedFood,
         grams,
         totalNutrition: {
            calories: selectedFood.nutrition.calories * gramsRatio,
            protein: selectedFood.nutrition.protein * gramsRatio,
            carbs: selectedFood.nutrition.carbs * gramsRatio,
            fat: selectedFood.nutrition.fat * gramsRatio,
         },
      };

      setSelectedFoods((prev) => [...prev, mealFood]);
      setShowGramsModal(false);
      setSelectedFood(null);
      setGramsInput("");
      setSearchQuery(""); // Clear search
      Keyboard.dismiss();
   };

   const handleUpdateGrams = (index: number, newGrams: string) => {
      const grams = parseFloat(newGrams);
      if (isNaN(grams) || grams <= 0) {
         setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
         return;
      }

      setSelectedFoods((prev) =>
         prev.map((mealFood, i) => {
            if (i === index) {
               const gramsRatio = grams / 100;
               return {
                  ...mealFood,
                  grams,
                  totalNutrition: {
                     calories: mealFood.food.nutrition.calories * gramsRatio,
                     protein: mealFood.food.nutrition.protein * gramsRatio,
                     carbs: mealFood.food.nutrition.carbs * gramsRatio,
                     fat: mealFood.food.nutrition.fat * gramsRatio,
                  },
               };
            }
            return mealFood;
         })
      );
   };

   const handleRemoveFood = (index: number) => {
      setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
   };

   const promptUpdateGrams = (index: number, currentGrams: number) => {
      if (Platform.OS === "web") {
         const newValue = prompt(
            "Digite a nova quantidade em gramas:",
            currentGrams.toString()
         );
         if (newValue) {
            handleUpdateGrams(index, newValue);
         }
      } else {
         // For mobile, we'll use a simple modal approach
         setSelectedFood(selectedFoods[index].food);
         setGramsInput(currentGrams.toString());
         // Store index to update instead of add
         (setShowGramsModal as any).updateIndex = index;
         setShowGramsModal(true);
      }
   };

   const handleSaveMeal = async () => {
      if (!mealName.trim()) {
         showAlert("Atenção", "Digite um nome para a refeição");
         return;
      }

      if (selectedFoods.length === 0) {
         showAlert("Atenção", "Adicione pelo menos um alimento");
         return;
      }

      setSaving(true);
      try {
         const totals = selectedFoods.reduce(
            (acc, mealFood) => ({
               calories: acc.calories + mealFood.totalNutrition.calories,
               protein: acc.protein + mealFood.totalNutrition.protein,
               carbs: acc.carbs + mealFood.totalNutrition.carbs,
               fat: acc.fat + mealFood.totalNutrition.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
         );

         if (isEditing && editingMealId) {
            await updateMeal(editingMealId, {
               meal_name: mealName.trim(),
               foods: selectedFoods.map((mf) => ({
                  id: mf.food.id,
                  name: mf.food.name,
                  grams: mf.grams,
                  nutrition: mf.totalNutrition,
               })),
               total_calories: totals.calories,
               total_protein: totals.protein,
               total_carbs: totals.carbs,
               total_fat: totals.fat,
            });
         } else {
            await addMeal({
               meal_name: mealName.trim(),
               foods: selectedFoods.map((mf) => ({
                  id: mf.food.id,
                  name: mf.food.name,
                  grams: mf.grams,
                  nutrition: mf.totalNutrition,
               })),
               total_calories: totals.calories,
               total_protein: totals.protein,
               total_carbs: totals.carbs,
               total_fat: totals.fat,
            });
         }

         // Optionally persist as recipe
         if (saveAsRecipe && user?.email) {
            await createRecipe(
               user.email,
               mealName.trim(),
               selectedFoods.map((mf) => ({
                  food_id: mf.food.id,
                  food_name: mf.food.name,
                  grams: mf.grams,
                  nutrition: mf.totalNutrition,
               }))
            );
         }

         if (shouldAutoClose) {
            // Auto-close without showing alert when coming from AI
            router.back();
         } else {
            showAlert(
               "Sucesso",
               isEditing
                  ? "Refeição atualizada com sucesso!"
                  : "Refeição adicionada com sucesso!"
            );
            router.back();
         }
      } catch (error) {
         devError("Error saving meal:", error);
         showAlert("Erro", "Falha ao salvar refeição");
      } finally {
         setSaving(false);
      }
   };

   // Prefill when editing
   useEffect(() => {
      if (!isEditing || !editingMealId) return;
      const meal = meals.find((m) => m.id === editingMealId);
      if (!meal) {
         showAlert("Atenção", "Refeição não encontrada");
         router.back();
         return;
      }
      setMealName(meal.meal_name);
      // Map stored foods (with totals) to MealFood with reconstructed per-100g nutrition
      const mapped = (meal.foods || []).map((f: any) => {
         const grams = Math.max(1, Number(f.grams) || 0);
         const ratio = grams > 0 ? 100 / grams : 0;
         const per100 = {
            calories: (f.nutrition?.calories || 0) * ratio,
            protein: (f.nutrition?.protein || 0) * ratio,
            carbs: (f.nutrition?.carbs || 0) * ratio,
            fat: (f.nutrition?.fat || 0) * ratio,
         };
         const food = {
            id: f.id,
            name: f.name,
            category: "Edição",
            serving: { unit: "g", amount: 100 },
            nutrition: per100,
         } as any;
         return {
            food,
            grams,
            totalNutrition: {
               calories: f.nutrition?.calories || 0,
               protein: f.nutrition?.protein || 0,
               carbs: f.nutrition?.carbs || 0,
               fat: f.nutrition?.fat || 0,
            },
         } as MealFood;
      });
      setSelectedFoods(mapped);
   }, [isEditing, editingMealId, meals]);

   const handleDeleteMeal = () => {
      if (!isEditing || !editingMealId) return;
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
                     await deleteMeal(editingMealId);
                     showAlert("Sucesso", "Refeição excluída");
                     router.back();
                  } catch (e) {
                     showAlert("Erro", "Falha ao excluir refeição");
                  }
               },
            },
         ]
      );
   };

   const totals = selectedFoods.reduce(
      (acc, mealFood) => ({
         calories: acc.calories + mealFood.totalNutrition.calories,
         protein: acc.protein + mealFood.totalNutrition.protein,
         carbs: acc.carbs + mealFood.totalNutrition.carbs,
         fat: acc.fat + mealFood.totalNutrition.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
   );

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <Stack.Screen
            options={{
               headerShown: true,
               title: isEditing ? "Editar Refeição" : "Adicionar Refeição",
               headerStyle: { backgroundColor: colors.background.secondary },
               headerTintColor: colors.text.primary,
               headerRight: isEditing
                  ? () => (
                       <TouchableOpacity onPress={handleDeleteMeal}>
                          <Ionicons
                             name="trash"
                             size={22}
                             color={colors.error}
                          />
                       </TouchableOpacity>
                    )
                  : undefined,
            }}
         />

         <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
         >
            {/* Meal Name Input */}
            <Card style={styles.section}>
               <Text style={styles.sectionTitle}>Nome da Refeição</Text>
               <Input
                  placeholder="Ex: Café da Manhã, Almoço, Jantar..."
                  value={mealName}
                  onChangeText={setMealName}
               />
               <TouchableOpacity
                  style={[
                     styles.recipeRow,
                     saveAsRecipe && styles.recipeRowActive,
                  ]}
                  onPress={() => setSaveAsRecipe((prev) => !prev)}
               >
                  <Ionicons
                     name={saveAsRecipe ? "checkbox" : "square-outline"}
                     size={20}
                     color={
                        saveAsRecipe
                           ? colors.primary[400]
                           : colors.text.secondary
                     }
                  />
                  <Text style={styles.recipeRowText}>
                     Salvar como receita recorrente
                  </Text>
               </TouchableOpacity>
               <View style={styles.recipeButtons}>
                  <Button
                     title="Usar Receita"
                     onPress={() => setRecipeModalVisible(true)}
                     variant="outline"
                     style={{ flex: 1 }}
                     icon={
                        <Ionicons
                           name="book"
                           size={18}
                           color={colors.primary[400]}
                        />
                     }
                  />
                  <Button
                     title="Adicionar Alimento"
                     onPress={() => setCustomFoodModalVisible(true)}
                     style={{ flex: 1 }}
                     icon={<Ionicons name="add" size={18} color="#fff" />}
                  />
               </View>
            </Card>
            {/* Food Search - Agora no topo */}
            <Card style={styles.section}>
               <Text style={styles.sectionTitle}>Buscar Alimentos</Text>
               <Input
                  placeholder="Digite para buscar alimentos..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  leftIcon={
                     <Ionicons
                        name="search"
                        size={20}
                        color={colors.text.tertiary}
                     />
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
               />

               {/* Food List */}
               {searchQuery.trim() &&
                  (searching || searchResults.length > 0) && (
                     <View style={styles.foodList}>
                        {searching ? (
                           <View
                              style={{
                                 paddingVertical: spacing.md,
                                 alignItems: "center",
                              }}
                           >
                              <ActivityIndicator
                                 size="small"
                                 color={colors.primary[400]}
                              />
                           </View>
                        ) : (
                           <Text style={styles.resultsCount}>
                              {searchResults.length} resultados encontrados
                           </Text>
                        )}
                        {searchResults.map((food) => (
                           <TouchableOpacity
                              key={food.id}
                              style={styles.foodItem}
                              onPress={() => handleSelectFood(food)}
                           >
                              <View style={styles.foodItemInfo}>
                                 <Text style={styles.foodItemName}>
                                    {food.name}
                                 </Text>
                                 <Text style={styles.foodItemDetails}>
                                    {food.category} • {food.nutrition.calories}{" "}
                                    kcal / 100g
                                 </Text>
                              </View>
                              <Ionicons
                                 name="add-circle"
                                 size={24}
                                 color={colors.primary[400]}
                              />
                           </TouchableOpacity>
                        ))}
                     </View>
                  )}

               {searchQuery.trim() &&
                  !searching &&
                  searchResults.length === 0 && (
                     <View style={styles.noResults}>
                        <Ionicons
                           name="search-outline"
                           size={48}
                           color={colors.text.tertiary}
                        />
                        <Text style={styles.noResultsText}>
                           Nenhum alimento encontrado
                        </Text>
                        <Text style={styles.noResultsHint}>
                           Tente buscar por outro nome
                        </Text>
                     </View>
                  )}
            </Card>

            {/* Selected Foods */}
            {selectedFoods.length > 0 && (
               <Card style={styles.section}>
                  <Text style={styles.sectionTitle}>Alimentos Adicionados</Text>
                  {selectedFoods.map((mealFood, index) => (
                     <View
                        key={`${mealFood.food.id}-${index}`}
                        style={styles.selectedFood}
                     >
                        <View style={styles.selectedFoodInfo}>
                           <Text style={styles.selectedFoodName}>
                              {mealFood.food.name}
                           </Text>
                           <Text style={styles.selectedFoodDetails}>
                              {mealFood.grams}g •{" "}
                              {Math.round(mealFood.totalNutrition.calories)}{" "}
                              kcal
                           </Text>
                        </View>
                        <View style={styles.selectedFoodActions}>
                           <TouchableOpacity
                              style={styles.editButton}
                              onPress={() =>
                                 promptUpdateGrams(index, mealFood.grams)
                              }
                           >
                              <Ionicons
                                 name="create-outline"
                                 size={20}
                                 color={colors.primary[400]}
                              />
                           </TouchableOpacity>
                           <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => handleRemoveFood(index)}
                           >
                              <Ionicons
                                 name="trash"
                                 size={20}
                                 color={colors.error}
                              />
                           </TouchableOpacity>
                        </View>
                     </View>
                  ))}

                  <View style={styles.totalsContainer}>
                     <Text style={styles.totalsTitle}>Totais</Text>
                     <View style={styles.totalsGrid}>
                        <View style={styles.totalItem}>
                           <Text style={styles.totalValue}>
                              {Math.round(totals.calories)}
                           </Text>
                           <Text style={styles.totalLabel}>kcal</Text>
                        </View>
                        <View style={styles.totalItem}>
                           <Text style={styles.totalValue}>
                              {Math.round(totals.protein)}g
                           </Text>
                           <Text style={styles.totalLabel}>Proteína</Text>
                        </View>
                        <View style={styles.totalItem}>
                           <Text style={styles.totalValue}>
                              {Math.round(totals.carbs)}g
                           </Text>
                           <Text style={styles.totalLabel}>Carbo</Text>
                        </View>
                        <View style={styles.totalItem}>
                           <Text style={styles.totalValue}>
                              {Math.round(totals.fat)}g
                           </Text>
                           <Text style={styles.totalLabel}>Gordura</Text>
                        </View>
                     </View>
                  </View>
               </Card>
            )}

            {/* AI Section - botão Utilizar IA que revela opções */}
            {isOnline && (
               <Card style={styles.cameraSection}>
                  <View style={styles.cameraSectionHeader}>
                     <Ionicons
                        name="sparkles"
                        size={24}
                        color={colors.primary[400]}
                     />
                     <Text style={styles.cameraSectionTitle}>
                        Identificar com IA
                     </Text>
                  </View>
                  <Button
                     title="Utilizar IA"
                     onPress={() => setShowAIOptions(true)}
                     icon={<Ionicons name="sparkles" size={18} color="#fff" />}
                     style={{ width: "100%" }}
                  />
               </Card>
            )}

            <View style={styles.bottomPadding} />
         </ScrollView>

         {/* Grams Input Modal */}
         <Modal
            visible={showGramsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGramsModal(false)}
         >
            <TouchableOpacity
               style={styles.modalOverlay}
               activeOpacity={1}
               onPress={() => setShowGramsModal(false)}
            >
               <View
                  style={styles.modalContent}
                  onStartShouldSetResponder={() => true}
               >
                  <Text style={styles.modalTitle}>Quantidade em gramas</Text>
                  <Text style={styles.modalSubtitle}>{selectedFood?.name}</Text>

                  <TextInput
                     style={styles.gramsInput}
                     value={gramsInput}
                     onChangeText={setGramsInput}
                     keyboardType="numeric"
                     placeholder="Digite a quantidade..."
                     placeholderTextColor={colors.text.tertiary}
                     autoFocus
                  />

                  {selectedFood &&
                     gramsInput &&
                     !isNaN(parseFloat(gramsInput)) && (
                        <View style={styles.nutritionPreview}>
                           <Text style={styles.previewLabel}>
                              Informação Nutricional:
                           </Text>
                           <Text style={styles.previewText}>
                              Calorias:{" "}
                              {Math.round(
                                 (selectedFood.nutrition.calories *
                                    parseFloat(gramsInput)) /
                                    100
                              )}{" "}
                              kcal
                           </Text>
                           <Text style={styles.previewText}>
                              Proteína:{" "}
                              {Math.round(
                                 (selectedFood.nutrition.protein *
                                    parseFloat(gramsInput)) /
                                    100
                              )}
                              g
                           </Text>
                        </View>
                     )}

                  <View style={styles.modalButtons}>
                     <Button
                        title="Cancelar"
                        onPress={() => setShowGramsModal(false)}
                        variant="outline"
                        style={styles.modalButton}
                     />
                     <Button
                        title="Adicionar"
                        onPress={handleConfirmGrams}
                        style={styles.modalButton}
                     />
                  </View>
               </View>
            </TouchableOpacity>
         </Modal>

         {/* AI Modal */}
         <Modal
            visible={showAIOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAIOptions(false)}
         >
            <TouchableOpacity
               style={styles.modalOverlay}
               activeOpacity={1}
               onPress={() => setShowAIOptions(false)}
            >
               <View
                  style={styles.modalContent}
                  onStartShouldSetResponder={() => true}
               >
                  <Text style={styles.modalTitle}>Identificar com IA</Text>
                  <TextInput
                     style={styles.aiDescriptionInput}
                     placeholder="Descreva sua refeição (ex: 1 prato com arroz branco, feijão carioca, 1 filé de peito de frango grelhado, salada de alface e tomate, 1 copo de suco de laranja)"
                     placeholderTextColor={colors.text.tertiary}
                     multiline
                     value={aiDescription}
                     onChangeText={setAIDescription}
                     numberOfLines={5}
                     autoFocus
                  />
                  <View style={styles.cameraButtons}>
                     <Button
                        title="Câmera"
                        icon={<Ionicons name="camera" size={20} color="#fff" />}
                        onPress={handleTakePhoto}
                        disabled={analyzingImage || analyzingText}
                        style={styles.cameraButton}
                     />
                     <Button
                        title="Galeria"
                        icon={<Ionicons name="images" size={20} color="#fff" />}
                        onPress={handlePickImage}
                        disabled={analyzingImage || analyzingText}
                        variant="outline"
                        style={styles.cameraButton}
                     />
                  </View>
                  <Button
                     title={analyzingText ? "Enviando..." : "Enviar"}
                     onPress={handleSendDescription}
                     disabled={analyzingText || analyzingImage}
                     style={styles.aiSendButton}
                  />
                  {(analyzingImage || analyzingText) && (
                     <View style={styles.analyzingContainer}>
                        <ActivityIndicator
                           size="small"
                           color={colors.primary[400]}
                        />
                        <Text style={styles.analyzingText}>
                           {analyzingImage
                              ? "Analisando imagem com IA..."
                              : "Analisando descrição com IA..."}
                        </Text>
                     </View>
                  )}
                  <View style={styles.modalButtons}>
                     <Button
                        title="Fechar"
                        variant="outline"
                        onPress={() => setShowAIOptions(false)}
                        style={styles.modalButton}
                     />
                  </View>
               </View>
            </TouchableOpacity>
         </Modal>

         {/* Modals */}
         <AddCustomFoodModal
            visible={customFoodModalVisible}
            onClose={() => setCustomFoodModalVisible(false)}
            onFoodAdded={() => performSearch(searchQuery)}
         />

         <RecipeModal
            visible={recipeModalVisible}
            onClose={() => setRecipeModalVisible(false)}
            onSelectRecipe={(recipe: Recipe) => {
               // Populate meal from recipe
               setMealName(recipe.name);
               const mapped: MealFood[] = recipe.foods.map((rf) => {
                  // Reconstruct per 100g nutrition from totals and grams
                  const ratio = rf.grams > 0 ? 100 / rf.grams : 0;
                  const per100: Food["nutrition"] = {
                     calories: rf.nutrition.calories * ratio,
                     protein: rf.nutrition.protein * ratio,
                     carbs: rf.nutrition.carbs * ratio,
                     fat: rf.nutrition.fat * ratio,
                  };
                  const food: Food = {
                     id: rf.food_id,
                     name: rf.food_name,
                     category: "Receita",
                     serving: { unit: "g", amount: 100 },
                     nutrition: per100,
                  };
                  return {
                     food,
                     grams: rf.grams,
                     totalNutrition: rf.nutrition,
                  };
               });
               setSelectedFoods(mapped);
            }}
         />

         {/* Save Button */}
         <View style={styles.footer}>
            <Button
               title="Salvar Refeição"
               onPress={handleSaveMeal}
               loading={saving}
               disabled={selectedFoods.length === 0 || !mealName.trim()}
               style={styles.saveButton}
            />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   content: {
      flex: 1,
   },
   cameraSection: {
      margin: spacing.lg,
   },
   cameraSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
   },
   cameraSectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   cameraSectionSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
      lineHeight: 20,
   },
   cameraButtons: {
      flexDirection: "row",
      gap: spacing.sm,
   },
   cameraButton: {
      flex: 1,
   },
   analyzingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.sm,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
   },
   analyzingText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   section: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
   },
   sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   recipeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.sm,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      marginTop: spacing.md,
   },
   recipeRowActive: {
      borderColor: colors.primary[500],
      backgroundColor: colors.background.elevated,
   },
   recipeRowText: {
      fontSize: typography.fontSize.base,
      color: colors.text.primary,
   },
   recipeButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
   },
   selectedFood: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
   },
   selectedFoodInfo: {
      flex: 1,
   },
   selectedFoodName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   selectedFoodDetails: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   selectedFoodActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
   },
   editButton: {
      padding: spacing.xs,
   },
   removeButton: {
      padding: spacing.xs,
   },
   totalsContainer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
   totalsTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   totalsGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
   },
   totalItem: {
      alignItems: "center",
   },
   totalValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
   },
   totalLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
   },
   foodList: {
      marginTop: spacing.md,
      gap: spacing.xs,
   },
   resultsCount: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
   },
   foodItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background.secondary,
   },
   foodItemInfo: {
      flex: 1,
   },
   foodItemName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   foodItemDetails: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   noResults: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
   },
   noResultsText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      marginTop: spacing.md,
   },
   noResultsHint: {
      fontSize: typography.fontSize.sm,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
   },
   bottomPadding: {
      height: spacing.xl,
   },
   footer: {
      padding: spacing.lg,
      backgroundColor: colors.background.secondary,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
   saveButton: {
      width: "100%",
   },
   aiDescriptionInput: {
      marginTop: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      minHeight: 120,
      textAlignVertical: "top",
      color: colors.text.primary,
   },
   aiSendButton: {
      width: "100%",
      marginTop: spacing.sm,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
   },
   modalContent: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      width: "100%",
      maxWidth: 400,
   },
   modalTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   modalSubtitle: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
   },
   gramsInput: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   nutritionPreview: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
   },
   previewLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
   },
   previewText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   modalButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
   },
   modalButton: {
      flex: 1,
   },
});
