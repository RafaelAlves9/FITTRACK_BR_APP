import { useMemo, useState } from "react";

export type OnboardingStepId =
   | "welcome"
   | "profile"
   | "weight"
   | "height"
   | "tutorial"
   | "finish";

export interface OnboardingStep {
   id: OnboardingStepId;
   title: string;
   subtitle: string;
   emphasis?: string;
}

export interface ProfileForm {
   name: string;
   gender: "male" | "female" | "other" | "";
   age: string;
   phone: string;
}

export interface TutorialSlide {
   id: string;
   title: string;
   description: string;
   icon: string;
   accent: string;
}

export const useOnboardingViewModel = () => {
   const steps: OnboardingStep[] = useMemo(
      () => [
         {
            id: "welcome",
            title: "Bem-vindo(a)",
            subtitle: "Vamos configurar rapidinho.",
         },
         {
            id: "profile",
            title: "Seu perfil",
            subtitle: "Nome e idade obrigatórios.",
         },
         {
            id: "weight",
            title: "Peso",
            subtitle: "Para gráficos e IMC.",
         },
         {
            id: "height",
            title: "Altura",
            subtitle: "Completa o básico.",
         },
         {
            id: "tutorial",
            title: "Tour",
            subtitle: "Veja os módulos.",
         },
         {
            id: "finish",
            title: "Tudo pronto!",
            subtitle: "Bons treinos! 💪",
         },
      ],
      []
   );

   const tutorialSlides: TutorialSlide[] = useMemo(
      () => [
         {
            id: "home",
            title: "Resumo",
            description: "Dia em 1 tela: treinos, água, calorias.",
            icon: "sparkles",
            accent: "#7c3aed",
         },
         {
            id: "workouts",
            title: "Treinos",
            description: "Monte, edite e marque presença.",
            icon: "barbell",
            accent: "#22c55e",
         },
         {
            id: "diet",
            title: "Dieta",
            description: "Refeições, macros e água.",
            icon: "restaurant",
            accent: "#f59e0b",
         },
         {
            id: "measure",
            title: "Medidas",
            description: "Peso, altura e circunferências.",
            icon: "body",
            accent: "#0ea5e9",
         },
         {
            id: "calendar",
            title: "Agenda",
            description: "Tudo no calendário.",
            icon: "calendar",
            accent: "#ec4899",
         },
      ],
      []
   );

   const [stepIndex, setStepIndex] = useState(0);
   const [profileForm, setProfileForm] = useState<ProfileForm>({
      name: "",
      gender: "",
      age: "",
      phone: "",
   });
   const [weight, setWeight] = useState("");
   const [height, setHeight] = useState("");
   const [tutorialIndex, setTutorialIndex] = useState(0);

   return {
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
   };
};

