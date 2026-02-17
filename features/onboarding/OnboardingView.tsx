import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
   View,
   Text,
   StyleSheet,
   Animated,
   ScrollView,
   TextInput,
   TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { Card, Button } from "@/components";
import {
   OnboardingStep,
   ProfileForm,
   TutorialSlide,
} from "./onboardingViewModel";

type OnboardingViewProps = {
   step: OnboardingStep;
   stepIndex: number;
   stepsCount: number;
   profileForm: ProfileForm;
   weightInput: string;
   heightInput: string;
   tutorialSlides: TutorialSlide[];
   tutorialIndex: number;
   loadingProfile: boolean;
   saving: boolean;
   onChangeProfile: (changes: Partial<ProfileForm>) => void;
   onChangeWeight: (value: string) => void;
   onChangeHeight: (value: string) => void;
   onNext: () => void;
   onBack: () => void;
   onSkipOptional: () => void;
   onTutorialNext: () => void;
   onTutorialPrev: () => void;
   onFinish: () => void;
};

export function OnboardingView({
   step,
   stepIndex,
   stepsCount,
   profileForm,
   weightInput,
   heightInput,
   tutorialSlides,
   tutorialIndex,
   loadingProfile,
   saving,
   onChangeProfile,
   onChangeWeight,
   onChangeHeight,
   onNext,
   onBack,
   onSkipOptional,
   onTutorialNext,
   onTutorialPrev,
   onFinish,
}: OnboardingViewProps) {
   const insets = useSafeAreaInsets();
   const progressAnim = useRef(new Animated.Value(stepIndex)).current;
   const pulseAnim = useRef(new Animated.Value(1)).current;

   const isFirstStep = stepIndex === 0;
   const isLastStep = step.id === "finish";
   const isOptional = step.id === "weight" || step.id === "height";

   const animateProgress = useCallback(
      (value: number) => {
         Animated.spring(progressAnim, {
            toValue: value,
            useNativeDriver: false,
            bounciness: 12,
         }).start();
      },
      [progressAnim]
   );

   const startPulse = useCallback(() => {
      Animated.loop(
         Animated.sequence([
            Animated.timing(pulseAnim, {
               toValue: 1.06,
               duration: 1100,
               useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
               toValue: 1,
               duration: 1100,
               useNativeDriver: true,
            }),
         ])
      ).start();
   }, [pulseAnim]);

   useEffect(() => {
      animateProgress(stepIndex);
   }, [stepIndex, animateProgress]);

   useEffect(() => {
      startPulse();
   }, [startPulse]);

   const progressWidth = progressAnim.interpolate({
      inputRange: [0, stepsCount - 1],
      outputRange: ["0%", "100%"],
   });

   const tutorialCard = useMemo(
      () => tutorialSlides[tutorialIndex],
      [tutorialIndex, tutorialSlides]
   );

   const renderProfile = () => (
      <View style={styles.formContent}>
         <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nome *</Text>
            <TextInput
               style={styles.inputField}
               placeholder="Seu nome"
               placeholderTextColor={colors.text.tertiary}
               value={profileForm.name}
               onChangeText={(text) => onChangeProfile({ name: text })}
               autoFocus
            />
         </View>

         <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Idade *</Text>
            <TextInput
               style={styles.inputField}
               placeholder="Ex: 28"
               placeholderTextColor={colors.text.tertiary}
               value={profileForm.age}
               onChangeText={(text) =>
                  onChangeProfile({ age: text.replace(/[^0-9]/g, "") })
               }
               keyboardType="number-pad"
               maxLength={3}
            />
         </View>

         <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Sexo</Text>
            <View style={styles.genderGroup}>
               {[
                  { id: "male", label: "Masculino", icon: "male" },
                  { id: "female", label: "Feminino", icon: "female" },
                  { id: "other", label: "Outro", icon: "transgender" },
               ].map((option) => (
                  <TouchableOpacity
                     key={option.id}
                     style={[
                        styles.genderOption,
                        profileForm.gender === option.id && styles.genderOptionActive,
                     ]}
                     onPress={() => onChangeProfile({ gender: option.id as any })}
                  >
                     <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={
                           profileForm.gender === option.id
                              ? colors.primary[400]
                              : colors.text.tertiary
                        }
                     />
                     <Text
                        style={[
                           styles.genderText,
                           profileForm.gender === option.id && styles.genderTextActive,
                        ]}
                     >
                        {option.label}
                     </Text>
                  </TouchableOpacity>
               ))}
            </View>
         </View>

         <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Celular (opcional)</Text>
            <TextInput
               style={styles.inputField}
               placeholder="(99) 99999-9999"
               placeholderTextColor={colors.text.tertiary}
               value={profileForm.phone}
               onChangeText={(text) =>
                  onChangeProfile({ phone: text.replace(/[^\d()+-\s]/g, "") })
               }
               keyboardType="phone-pad"
               maxLength={16}
            />
         </View>
      </View>
   );

   const renderNumberInput = (
      placeholder: string,
      value: string,
      onChange: (text: string) => void,
      unit: string
   ) => (
      <View style={styles.numberInputContainer}>
         <View style={styles.numberInputWrapper}>
            <TextInput
               style={styles.numberInput}
               placeholder={placeholder}
               placeholderTextColor={colors.text.tertiary}
               value={value}
               onChangeText={(text) => onChange(text.replace(/[^0-9.,]/g, ""))}
               keyboardType="decimal-pad"
               autoFocus
            />
            <Text style={styles.unitLabel}>{unit}</Text>
         </View>
         <Text style={styles.numberHint}>Informe o valor atual</Text>
      </View>
   );

   const renderTutorial = () => (
      <View style={styles.tutorialContent}>
         <Animated.View
            style={[
               styles.tutorialIconContainer,
               { transform: [{ scale: pulseAnim }] },
            ]}
         >
            <LinearGradient
               colors={[tutorialCard.accent + "33", tutorialCard.accent + "11"]}
               style={styles.tutorialIconGradient}
            >
               <Ionicons
                  name={tutorialCard.icon as any}
                  size={72}
                  color={tutorialCard.accent}
               />
            </LinearGradient>
         </Animated.View>

         <View style={styles.tutorialTextContainer}>
            <Text style={styles.tutorialTitle}>{tutorialCard.title}</Text>
            <Text style={styles.tutorialDescription}>
               {tutorialCard.description}
            </Text>
         </View>

         <View style={styles.tutorialDotsContainer}>
            {tutorialSlides.map((slide, index) => (
               <View
                  key={slide.id}
                  style={[
                     styles.tutorialDot,
                     index === tutorialIndex && styles.tutorialDotActive,
                  ]}
               />
            ))}
         </View>

         <View style={styles.tutorialActions}>
            <Button
               title="Anterior"
               variant="outline"
               onPress={onTutorialPrev}
               disabled={tutorialIndex === 0}
               style={styles.flex1}
            />
            <Button
               title={
                  tutorialIndex === tutorialSlides.length - 1
                     ? "Concluir"
                     : "Próximo"
               }
               onPress={
                  tutorialIndex === tutorialSlides.length - 1
                     ? onNext
                     : onTutorialNext
               }
               style={styles.flex1}
            />
         </View>
      </View>
   );

   const renderStepContent = () => {
      switch (step.id) {
         case "welcome":
            return (
               <View style={styles.welcomeContent}>
                  <Animated.View
                     style={[
                        styles.welcomeIcon,
                        { transform: [{ scale: pulseAnim }] },
                     ]}
                  >
                     <LinearGradient
                        colors={[colors.primary[400], colors.secondary[400]]}
                        style={styles.welcomeIconGradient}
                     >
                        <Ionicons name="rocket" size={64} color="#fff" />
                     </LinearGradient>
                  </Animated.View>
                  <Text style={styles.welcomeTitle}>Bem-vindo ao FitTrack</Text>
                  <Text style={styles.welcomeSubtitle}>
                     Configure em 2 minutos e comece
                  </Text>
               </View>
            );
         case "profile":
            return renderProfile();
         case "weight":
            return renderNumberInput("72,4", weightInput, onChangeWeight, "kg");
         case "height":
            return renderNumberInput("175", heightInput, onChangeHeight, "cm");
         case "tutorial":
            return renderTutorial();
         case "finish":
            return (
               <View style={styles.welcomeContent}>
                  <Animated.View
                     style={[
                        styles.welcomeIcon,
                        { transform: [{ scale: pulseAnim }] },
                     ]}
                  >
                     <LinearGradient
                        colors={[colors.accent[400], colors.accent[500]]}
                        style={styles.welcomeIconGradient}
                     >
                        <Ionicons name="checkmark-circle" size={64} color="#fff" />
                     </LinearGradient>
                  </Animated.View>
                  <Text style={styles.welcomeTitle}>Tudo pronto!</Text>
                  <Text style={styles.welcomeSubtitle}>
                     Seu app está configurado
                  </Text>
               </View>
            );
         default:
            return null;
      }
   };

   return (
      <LinearGradient
         colors={[colors.background.primary, colors.background.secondary]}
         style={[styles.container, { paddingTop: insets.top + spacing.md }]}
      >
         <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
         >
            <View style={styles.progressHeader}>
               <View style={styles.badgeRow}>
                  <Ionicons name="flash" size={16} color={colors.primary[400]} />
                  <Text style={styles.stepLabel}>
                     {stepIndex + 1}/{stepsCount}
                  </Text>
               </View>
               {isOptional ? (
                  <TouchableOpacity onPress={onSkipOptional}>
                     <Text style={styles.skipText}>Pular</Text>
                  </TouchableOpacity>
               ) : null}
            </View>
            <View style={styles.progressBar}>
               <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <Card style={styles.card}>
               {step.id === "profile" && (
                  <View style={styles.cardHeader}>
                     <Text style={styles.title}>{step.title}</Text>
                     {step.subtitle ? (
                        <Text style={styles.subtitle}>{step.subtitle}</Text>
                     ) : null}
                  </View>
               )}

               {loadingProfile ? (
                  <Text style={styles.loadingText}>Carregando suas infos...</Text>
               ) : (
                  renderStepContent()
               )}
            </Card>
         </ScrollView>

         {step.id !== "tutorial" && (
            <View style={styles.footer}>
               {!isFirstStep ? (
                  <Button
                     title="Voltar"
                     variant="outline"
                     onPress={onBack}
                     style={styles.flex1}
                  />
               ) : (
                  <View style={[styles.flex1, { opacity: 0 }]} />
               )}
               <Button
                  title={isLastStep ? "Ir para o app" : "Continuar"}
                  onPress={isLastStep ? onFinish : onNext}
                  loading={saving}
                  style={styles.flex1}
               />
            </View>
         )}
      </LinearGradient>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing["4xl"],
      gap: spacing.xl,
   },
   progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
   },
   badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      backgroundColor: colors.background.elevated,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
   },
   stepLabel: {
      color: colors.primary[400],
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
   },
   skipText: {
      color: colors.primary[400],
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
   },
   progressBar: {
      height: 6,
      backgroundColor: colors.background.elevated,
      borderRadius: borderRadius.full,
      overflow: "hidden",
   },
   progressFill: {
      height: "100%",
      backgroundColor: colors.primary[400],
   },
   card: {
      padding: spacing.xl,
      flex: 1,
   },
   cardHeader: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
   },
   title: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   subtitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text.secondary,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
   },
   
   // Welcome & Finish
   welcomeContent: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xl,
      paddingVertical: spacing["2xl"],
   },
   welcomeIcon: {
      marginBottom: spacing.md,
   },
   welcomeIconGradient: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: "center",
      alignItems: "center",
   },
   welcomeTitle: {
      fontSize: typography.fontSize["4xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      textAlign: "center",
   },
   welcomeSubtitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
   },

   // Profile Form
   formContent: {
      gap: spacing["2xl"],
   },
   inputWrapper: {
      gap: spacing.sm,
   },
   inputLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
   },
   inputField: {
      backgroundColor: colors.background.elevated,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      borderWidth: 2,
      borderColor: colors.border.default,
   },
   genderGroup: {
      gap: spacing.md,
   },
   genderOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.background.elevated,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border.default,
   },
   genderOptionActive: {
      borderColor: colors.primary[400],
      backgroundColor: colors.primary[900] + "20",
   },
   genderText: {
      fontSize: typography.fontSize.lg,
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
   },
   genderTextActive: {
      color: colors.primary[400],
      fontWeight: typography.fontWeight.bold,
   },

   // Number Input (Weight/Height)
   numberInputContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xl,
      paddingVertical: spacing["2xl"],
   },
   numberInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
   },
   numberInput: {
      fontSize: 80,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
      textAlign: "center",
      minWidth: 180,
   },
   unitLabel: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.tertiary,
   },
   numberHint: {
      fontSize: typography.fontSize.base,
      color: colors.text.tertiary,
      textAlign: "center",
   },

   // Tutorial
   tutorialContent: {
      alignItems: "center",
      gap: spacing["2xl"],
      paddingVertical: spacing.xl,
   },
   tutorialIconContainer: {
      marginBottom: spacing.md,
   },
   tutorialIconGradient: {
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: "center",
      alignItems: "center",
   },
   tutorialTextContainer: {
      gap: spacing.md,
      alignItems: "center",
   },
   tutorialTitle: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      textAlign: "center",
   },
   tutorialDescription: {
      fontSize: typography.fontSize.lg,
      color: colors.text.secondary,
      textAlign: "center",
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
      paddingHorizontal: spacing.md,
   },
   tutorialDotsContainer: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
   },
   tutorialDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.border.light,
   },
   tutorialDotActive: {
      backgroundColor: colors.primary[400],
      width: 32,
   },
   tutorialActions: {
      flexDirection: "row",
      gap: spacing.md,
      width: "100%",
      marginTop: spacing.md,
   },

   footer: {
      flexDirection: "row",
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
   },
   flex1: {
      flex: 1,
   },
   loadingText: {
      color: colors.text.secondary,
      fontSize: typography.fontSize.base,
      textAlign: "center",
      paddingVertical: spacing["2xl"],
   },
});

