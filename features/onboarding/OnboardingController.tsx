import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/hooks/useData";
import { useAlert } from "@/hooks/useAlert";
import { devWarn, devError } from "@/utils/logger";
import { getUserProfile, updateUserProfile, syncUserProfileToBackend } from "@/services/profile";
import { OnboardingView } from "./OnboardingView";
import { useOnboardingViewModel } from "./onboardingViewModel";

export default function OnboardingController() {
   const { user } = useAuth();
   const router = useRouter();
   const { addMeasurement } = useData();
   const { showAlert } = useAlert();

   const [loadingProfile, setLoadingProfile] = useState(true);
   const [saving, setSaving] = useState(false);
   const {
      steps,
      stepIndex,
      setStepIndex,
      profileForm,
      setProfileForm,
      weight,
      setWeight,
      height,
      setHeight,
      tutorialSlides,
      tutorialIndex,
      setTutorialIndex,
   } = useOnboardingViewModel();

   const formatPhone = useCallback((raw: string) => {
      const digits = raw.replace(/\D/g, "");
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10)
         return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
   }, []);

   const loadProfile = useCallback(async () => {
      if (!user) {
         router.replace("/login");
         return;
      }

      try {
         setLoadingProfile(true);
         const profile = await getUserProfile(user.id);

         if (profile?.onboarding_completed) {
            router.replace("/(tabs)");
            return;
         }

         if (profile) {
            setProfileForm({
               name: profile.username || "",
               gender: (profile.gender as any) || "",
               age: profile.age ? String(profile.age) : "",
               phone: profile.phone || "",
            });
         }
      } catch (error) {
         devWarn("Falha ao carregar perfil no onboarding:", error);
      } finally {
         setLoadingProfile(false);
      }
   }, [router, setProfileForm, user]);

   useEffect(() => {
      loadProfile();
   }, [loadProfile]);

   const goToNextStep = () => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
   };

   const goToPreviousStep = () => {
      setStepIndex((prev) => Math.max(prev - 1, 0));
   };

   const handleProfileStep = async () => {
      if (!user) {
         router.replace("/login");
         return;
      }

      const trimmedName = profileForm.name.trim();
      const parsedAge =
         profileForm.age.trim().length > 0
            ? parseInt(profileForm.age.trim(), 10)
            : NaN;

      if (!trimmedName) {
         showAlert("Atenção", "Nome é obrigatório.");
         return;
      }
      if (isNaN(parsedAge) || parsedAge <= 0) {
         showAlert("Atenção", "Informe uma idade válida.");
         return;
      }

      try {
         setSaving(true);
         await updateUserProfile(user.id, {
            username: trimmedName,
            phone: profileForm.phone ? formatPhone(profileForm.phone) : "",
            gender: profileForm.gender,
            age: parsedAge,
         }, true);
         goToNextStep();
      } catch (error) {
         devError("Erro ao salvar perfil no onboarding:", error);
         showAlert("Erro", "Não foi possível salvar seus dados.");
      } finally {
         setSaving(false);
      }
   };

   const persistMeasurement = async (
      type: "weight" | "height",
      value: string
   ) => {
      if (!user) {
         router.replace("/login");
         return false;
      }
      const normalized = value.replace(",", ".").trim();
      if (!normalized) {
         return true;
      }
      const parsed = parseFloat(normalized);
      if (isNaN(parsed) || parsed <= 0) {
         showAlert("Atenção", "Informe um valor válido.");
         return false;
      }
      try {
         setSaving(true);
         await addMeasurement(type, parsed);
         return true;
      } catch (error) {
         devError(`Erro ao salvar ${type}:`, error);
         showAlert("Erro", "Não foi possível salvar este valor.");
         return false;
      } finally {
         setSaving(false);
      }
   };

   const handleWeightStep = async () => {
      const ok = await persistMeasurement("weight", weight);
      if (ok) {
         goToNextStep();
      }
   };

   const handleHeightStep = async () => {
      const ok = await persistMeasurement("height", height);
      if (ok) {
         goToNextStep();
      }
   };

   const handleTutorialPrev = () => {
      setTutorialIndex((prev) => Math.max(prev - 1, 0));
   };

   const handleTutorialNext = () => {
      setTutorialIndex((prev) =>
         Math.min(prev + 1, tutorialSlides.length - 1)
      );
   };

   const finishOnboarding = async () => {
      if (!user) {
         router.replace("/login");
         return;
      }
      try {
         setSaving(true);
         await updateUserProfile(user.id, { onboarding_completed: true }, true);
         
         const profile = await getUserProfile(user.id);
         if (profile) {
            await syncUserProfileToBackend(profile);
         }
         
         router.replace("/(tabs)");
      } catch (error) {
         devError("Erro ao finalizar onboarding:", error);
         
         // Revert onboarding status if sync fails, so user is not locked out
         try {
            await updateUserProfile(user.id, { onboarding_completed: false }, true);
         } catch (revertErr) {
            devError("Failed to revert onboarding status:", revertErr);
         }

         showAlert("Erro", "Não foi possível finalizar. Tente novamente.");
      } finally {
         setSaving(false);
      }
   };

   const handleNext = () => {
      const current = steps[stepIndex]?.id;
      if (current === "profile") {
         handleProfileStep();
         return;
      }
      if (current === "weight") {
         handleWeightStep();
         return;
      }
      if (current === "height") {
         handleHeightStep();
         return;
      }
      if (current === "tutorial") {
         if (tutorialIndex === tutorialSlides.length - 1) {
            goToNextStep();
         } else {
            handleTutorialNext();
         }
         return;
      }
      if (current === "finish") {
         finishOnboarding();
         return;
      }
      goToNextStep();
   };

   const handleSkipOptional = () => {
      goToNextStep();
   };

   return (
      <OnboardingView
         step={steps[stepIndex]}
         stepIndex={stepIndex}
         stepsCount={steps.length}
         profileForm={profileForm}
         weightInput={weight}
         heightInput={height}
         tutorialSlides={tutorialSlides}
         tutorialIndex={tutorialIndex}
         loadingProfile={loadingProfile}
         saving={saving}
         onChangeProfile={(changes) =>
            setProfileForm((prev) => ({ ...prev, ...changes }))
         }
         onChangeWeight={(value) => {
            setWeight(value);
         }}
         onChangeHeight={(value) => {
            setHeight(value);
         }}
         onNext={handleNext}
         onBack={goToPreviousStep}
         onSkipOptional={handleSkipOptional}
         onTutorialNext={handleTutorialNext}
         onTutorialPrev={handleTutorialPrev}
         onFinish={finishOnboarding}
      />
   );
}

