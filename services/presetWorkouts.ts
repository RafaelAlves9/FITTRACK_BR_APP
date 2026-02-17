/**
 * Preset Workouts Service
 * Mock data service for pre-built workouts
 * Future: Will fetch from API endpoint
 */

import { 
  PresetWorkout, 
  WorkoutLevel, 
  WorkoutCategory, 
  WorkoutFilters,
  FavoriteWorkout,
  WorkoutSession 
} from '@/types/workout';
import { storage, STORAGE_KEYS } from './storage';
import { generateUUID } from '@/utils/uuid';
import { logAction } from './actionLogs';

// Storage keys for favorites and sessions
const FAVORITES_KEY = '@fittrack_workout_favorites';
const SESSIONS_KEY = '@fittrack_workout_sessions';
const keyToTable = (key: string) => key.replace('@fittrack_', '');

// Sample YouTube video URLs for exercises
const EXERCISE_VIDEOS = {
  warrior1: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  warrior2: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  sidePlank: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  downwardDog: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  plank: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  squat: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  pushup: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  lunge: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  burpee: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  jumpingJack: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  mountainClimber: 'https://www.youtube.com/embed/piT2Lvhi1AU',
  crunch: 'https://www.youtube.com/embed/piT2Lvhi1AU',
};

// Sample workout images (using placeholder URLs - replace with real images)
const WORKOUT_IMAGES = {
  yoga1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  yoga2: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
  yoga3: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800',
  musculation1: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
  musculation2: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=800',
  musculation3: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  crossfit1: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800',
  crossfit2: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  cardio1: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800',
  cardio2: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
  stretching1: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
  functional1: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800',
};

// Exercise images
const EXERCISE_IMAGES = {
  warrior1: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  warrior2: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
  sidePlank: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
  downwardDog: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400',
  plank: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400',
  squat: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
  pushup: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
  lunge: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400',
  burpee: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
  jumpingJack: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400',
  mountainClimber: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400',
  crunch: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
};

// Mock preset workouts data
const PRESET_WORKOUTS: PresetWorkout[] = [
  // YOGA - Beginner
  {
    id: 'yoga-body-stretching',
    name: 'Yoga Body Stretching',
    description: 'Sequência suave de yoga para alongamento corporal completo. Ideal para iniciantes.',
    level: 'beginner',
    category: 'yoga',
    imageUrl: WORKOUT_IMAGES.yoga1,
    duration: 10,
    exerciseCount: 10,
    estimatedCalories: 80,
    isFeatured: true,
    exercises: [
      {
        id: 'warrior1',
        name: 'Warrior 1',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.warrior1,
        videoUrl: EXERCISE_VIDEOS.warrior1,
        description: 'Posição do guerreiro 1 - fortalece pernas e alongamento de quadris',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Flexores do quadril'],
        caloriesPerMinute: 4,
      },
      {
        id: 'side-plank',
        name: 'Side Plank',
        duration: 20,
        imageUrl: EXERCISE_IMAGES.sidePlank,
        videoUrl: EXERCISE_VIDEOS.sidePlank,
        description: 'Prancha lateral - fortalece core e oblíquos',
        targetMuscles: ['Oblíquos', 'Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
      {
        id: 'one-leg-downward',
        name: 'One Leg Downward Dog',
        duration: 20,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Cachorro olhando para baixo com uma perna elevada',
        targetMuscles: ['Isquiotibiais', 'Panturrilhas', 'Ombros'],
        caloriesPerMinute: 4,
      },
      {
        id: 'warrior2',
        name: 'Warrior 2',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Posição do guerreiro 2 - abre quadris e fortalece pernas',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Adutores'],
        caloriesPerMinute: 4,
      },
      {
        id: 'plank',
        name: 'Plank Hold',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha isométrica para fortalecimento do core',
        targetMuscles: ['Core', 'Ombros', 'Glúteos'],
        caloriesPerMinute: 5,
      },
      {
        id: 'side-plank-2',
        name: 'Side Plank (outro lado)',
        duration: 20,
        imageUrl: EXERCISE_IMAGES.sidePlank,
        videoUrl: EXERCISE_VIDEOS.sidePlank,
        description: 'Prancha lateral do outro lado',
        targetMuscles: ['Oblíquos', 'Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
      {
        id: 'downward-dog',
        name: 'Downward Dog',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Cachorro olhando para baixo - alongamento de toda cadeia posterior',
        targetMuscles: ['Isquiotibiais', 'Panturrilhas', 'Ombros'],
        caloriesPerMinute: 3,
      },
      {
        id: 'warrior1-2',
        name: 'Warrior 1 (outro lado)',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.warrior1,
        videoUrl: EXERCISE_VIDEOS.warrior1,
        description: 'Posição do guerreiro 1 do outro lado',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Flexores do quadril'],
        caloriesPerMinute: 4,
      },
      {
        id: 'warrior2-2',
        name: 'Warrior 2 (outro lado)',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Posição do guerreiro 2 do outro lado',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Adutores'],
        caloriesPerMinute: 4,
      },
      {
        id: 'final-stretch',
        name: 'Final Stretch',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Alongamento final relaxante',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 2,
      },
    ],
  },
  
  // MUSCULATION - Beginner
  {
    id: 'full-body-stretching',
    name: 'Full Body Stretching',
    description: 'Treino completo de corpo inteiro com foco em alongamento e fortalecimento básico.',
    level: 'beginner',
    category: 'stretching',
    imageUrl: WORKOUT_IMAGES.stretching1,
    duration: 10,
    exerciseCount: 8,
    estimatedCalories: 120,
    isFeatured: true,
    exercises: [
      {
        id: 'squat-stretch',
        name: 'Squat',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento básico para fortalecer pernas',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
        caloriesPerMinute: 8,
      },
      {
        id: 'pushup-basic',
        name: 'Push-up',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Flexão de braço tradicional',
        targetMuscles: ['Peito', 'Tríceps', 'Ombros'],
        caloriesPerMinute: 7,
      },
      {
        id: 'lunge-basic',
        name: 'Lunge',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.lunge,
        videoUrl: EXERCISE_VIDEOS.lunge,
        description: 'Afundo para fortalecer pernas e glúteos',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        caloriesPerMinute: 6,
      },
      {
        id: 'plank-hold',
        name: 'Plank',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha isométrica',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
      {
        id: 'squat-2',
        name: 'Squat',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Segunda série de agachamento',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
        caloriesPerMinute: 8,
      },
      {
        id: 'pushup-2',
        name: 'Push-up',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Segunda série de flexão',
        targetMuscles: ['Peito', 'Tríceps', 'Ombros'],
        caloriesPerMinute: 7,
      },
      {
        id: 'lunge-2',
        name: 'Lunge (outro lado)',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.lunge,
        videoUrl: EXERCISE_VIDEOS.lunge,
        description: 'Afundo do outro lado',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        caloriesPerMinute: 6,
      },
      {
        id: 'plank-2',
        name: 'Plank Final',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha final mais longa',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
    ],
  },
  
  // CROSSFIT - Intermediate
  {
    id: 'hiit-burn',
    name: 'HIIT Burn',
    description: 'Treino intervalado de alta intensidade para queima máxima de calorias.',
    level: 'intermediate',
    category: 'crossfit',
    imageUrl: WORKOUT_IMAGES.crossfit1,
    duration: 15,
    exerciseCount: 10,
    estimatedCalories: 250,
    isFeatured: true,
    exercises: [
      {
        id: 'burpee-1',
        name: 'Burpees',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Burpee completo com salto',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'jumping-jack-1',
        name: 'Jumping Jacks',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Polichinelos rápidos',
        targetMuscles: ['Pernas', 'Ombros', 'Core'],
        caloriesPerMinute: 10,
      },
      {
        id: 'mountain-climber-1',
        name: 'Mountain Climbers',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Escalador de montanha',
        targetMuscles: ['Core', 'Ombros', 'Quadríceps'],
        caloriesPerMinute: 11,
      },
      {
        id: 'squat-jump',
        name: 'Squat Jumps',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento com salto',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilhas'],
        caloriesPerMinute: 12,
      },
      {
        id: 'plank-hiit',
        name: 'Plank',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha para recuperação ativa',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
      {
        id: 'burpee-2',
        name: 'Burpees',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Segunda série de burpees',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'jumping-jack-2',
        name: 'Jumping Jacks',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Segunda série de polichinelos',
        targetMuscles: ['Pernas', 'Ombros', 'Core'],
        caloriesPerMinute: 10,
      },
      {
        id: 'mountain-climber-2',
        name: 'Mountain Climbers',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Segunda série de escalador',
        targetMuscles: ['Core', 'Ombros', 'Quadríceps'],
        caloriesPerMinute: 11,
      },
      {
        id: 'squat-jump-2',
        name: 'Squat Jumps',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Segunda série de agachamento com salto',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Panturrilhas'],
        caloriesPerMinute: 12,
      },
      {
        id: 'plank-final-hiit',
        name: 'Plank Final',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha final de resistência',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
    ],
  },
  
  // CARDIO - Intermediate
  {
    id: 'cardio-blast',
    name: 'Cardio Blast',
    description: 'Sessão de cardio intenso para melhorar resistência cardiovascular.',
    level: 'intermediate',
    category: 'cardio',
    imageUrl: WORKOUT_IMAGES.cardio1,
    duration: 12,
    exerciseCount: 8,
    estimatedCalories: 180,
    isFeatured: false,
    exercises: [
      {
        id: 'jumping-jack-cardio',
        name: 'Jumping Jacks',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Aquecimento com polichinelos',
        targetMuscles: ['Pernas', 'Ombros'],
        caloriesPerMinute: 10,
      },
      {
        id: 'high-knees',
        name: 'High Knees',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Corrida estacionária com joelhos altos',
        targetMuscles: ['Quadríceps', 'Core'],
        caloriesPerMinute: 11,
      },
      {
        id: 'butt-kicks',
        name: 'Butt Kicks',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Corrida estacionária com calcanhar no glúteo',
        targetMuscles: ['Isquiotibiais', 'Glúteos'],
        caloriesPerMinute: 9,
      },
      {
        id: 'mountain-climber-cardio',
        name: 'Mountain Climbers',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Escalador intenso',
        targetMuscles: ['Core', 'Ombros', 'Quadríceps'],
        caloriesPerMinute: 11,
      },
      {
        id: 'jumping-jack-cardio-2',
        name: 'Jumping Jacks',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Segunda série de polichinelos',
        targetMuscles: ['Pernas', 'Ombros'],
        caloriesPerMinute: 10,
      },
      {
        id: 'high-knees-2',
        name: 'High Knees',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Segunda série de joelhos altos',
        targetMuscles: ['Quadríceps', 'Core'],
        caloriesPerMinute: 11,
      },
      {
        id: 'squat-pulse',
        name: 'Squat Pulse',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento com pulsos',
        targetMuscles: ['Quadríceps', 'Glúteos'],
        caloriesPerMinute: 8,
      },
      {
        id: 'cool-down',
        name: 'Cool Down Stretch',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Alongamento de desaquecimento',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 2,
      },
    ],
  },
  
  // MUSCULATION - Advanced
  {
    id: 'strength-power',
    name: 'Strength Power',
    description: 'Treino avançado de força e potência muscular. Requer boa condição física.',
    level: 'advanced',
    category: 'musculation',
    imageUrl: WORKOUT_IMAGES.musculation1,
    duration: 20,
    exerciseCount: 12,
    estimatedCalories: 320,
    isFeatured: false,
    exercises: [
      {
        id: 'squat-adv',
        name: 'Squat',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento profundo',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
        caloriesPerMinute: 8,
      },
      {
        id: 'pushup-adv',
        name: 'Push-up',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Flexão de braço completa',
        targetMuscles: ['Peito', 'Tríceps', 'Ombros'],
        caloriesPerMinute: 7,
      },
      {
        id: 'burpee-adv',
        name: 'Burpees',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Burpee com flexão',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'plank-adv',
        name: 'Plank',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha de longa duração',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
      {
        id: 'lunge-jump',
        name: 'Jump Lunges',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.lunge,
        videoUrl: EXERCISE_VIDEOS.lunge,
        description: 'Afundo com salto alternado',
        targetMuscles: ['Quadríceps', 'Glúteos'],
        caloriesPerMinute: 11,
      },
      {
        id: 'mountain-adv',
        name: 'Mountain Climbers',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Escalador rápido',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 11,
      },
      {
        id: 'squat-adv-2',
        name: 'Squat',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Segunda série de agachamento',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
        caloriesPerMinute: 8,
      },
      {
        id: 'pushup-diamond',
        name: 'Diamond Push-up',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Flexão diamante para tríceps',
        targetMuscles: ['Tríceps', 'Peito'],
        caloriesPerMinute: 8,
      },
      {
        id: 'burpee-adv-2',
        name: 'Burpees',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Segunda série de burpees',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'side-plank-adv',
        name: 'Side Plank',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.sidePlank,
        videoUrl: EXERCISE_VIDEOS.sidePlank,
        description: 'Prancha lateral',
        targetMuscles: ['Oblíquos', 'Core'],
        caloriesPerMinute: 5,
      },
      {
        id: 'side-plank-adv-2',
        name: 'Side Plank (outro lado)',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.sidePlank,
        videoUrl: EXERCISE_VIDEOS.sidePlank,
        description: 'Prancha lateral outro lado',
        targetMuscles: ['Oblíquos', 'Core'],
        caloriesPerMinute: 5,
      },
      {
        id: 'plank-final-adv',
        name: 'Plank Final',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha final de resistência',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 5,
      },
    ],
  },
  
  // YOGA - Intermediate
  {
    id: 'yoga-flow',
    name: 'Yoga Flow',
    description: 'Fluxo de yoga dinâmico para flexibilidade e força.',
    level: 'intermediate',
    category: 'yoga',
    imageUrl: WORKOUT_IMAGES.yoga2,
    duration: 15,
    exerciseCount: 10,
    estimatedCalories: 120,
    isFeatured: false,
    exercises: [
      {
        id: 'sun-salutation',
        name: 'Sun Salutation',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.warrior1,
        videoUrl: EXERCISE_VIDEOS.warrior1,
        description: 'Saudação ao sol completa',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 5,
      },
      {
        id: 'warrior-flow-1',
        name: 'Warrior 1',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.warrior1,
        videoUrl: EXERCISE_VIDEOS.warrior1,
        description: 'Guerreiro 1 com respiração',
        targetMuscles: ['Pernas', 'Core'],
        caloriesPerMinute: 4,
      },
      {
        id: 'warrior-flow-2',
        name: 'Warrior 2',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Transição para guerreiro 2',
        targetMuscles: ['Pernas', 'Quadris'],
        caloriesPerMinute: 4,
      },
      {
        id: 'triangle',
        name: 'Triangle Pose',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Postura do triângulo',
        targetMuscles: ['Oblíquos', 'Pernas'],
        caloriesPerMinute: 3,
      },
      {
        id: 'downward-flow',
        name: 'Downward Dog',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Cachorro olhando para baixo',
        targetMuscles: ['Cadeia posterior'],
        caloriesPerMinute: 3,
      },
      {
        id: 'warrior-flow-1b',
        name: 'Warrior 1 (outro lado)',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.warrior1,
        videoUrl: EXERCISE_VIDEOS.warrior1,
        description: 'Guerreiro 1 outro lado',
        targetMuscles: ['Pernas', 'Core'],
        caloriesPerMinute: 4,
      },
      {
        id: 'warrior-flow-2b',
        name: 'Warrior 2 (outro lado)',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Guerreiro 2 outro lado',
        targetMuscles: ['Pernas', 'Quadris'],
        caloriesPerMinute: 4,
      },
      {
        id: 'triangle-b',
        name: 'Triangle (outro lado)',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.warrior2,
        videoUrl: EXERCISE_VIDEOS.warrior2,
        description: 'Triângulo outro lado',
        targetMuscles: ['Oblíquos', 'Pernas'],
        caloriesPerMinute: 3,
      },
      {
        id: 'plank-yoga',
        name: 'Plank to Cobra',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Transição prancha para cobra',
        targetMuscles: ['Core', 'Peito'],
        caloriesPerMinute: 4,
      },
      {
        id: 'savasana',
        name: 'Savasana',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Relaxamento final',
        targetMuscles: ['Relaxamento'],
        caloriesPerMinute: 1,
      },
    ],
  },
  
  // FUNCTIONAL - Advanced
  {
    id: 'functional-beast',
    name: 'Functional Beast',
    description: 'Treino funcional intenso para atletas. Alta intensidade.',
    level: 'advanced',
    category: 'functional',
    imageUrl: WORKOUT_IMAGES.functional1,
    duration: 25,
    exerciseCount: 12,
    estimatedCalories: 400,
    isFeatured: false,
    exercises: [
      {
        id: 'burpee-func',
        name: 'Burpees',
        duration: 50,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Burpees intensos',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'squat-jump-func',
        name: 'Squat Jumps',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento com salto explosivo',
        targetMuscles: ['Pernas', 'Glúteos'],
        caloriesPerMinute: 12,
      },
      {
        id: 'mountain-func',
        name: 'Mountain Climbers',
        duration: 50,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Escalador rápido',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 11,
      },
      {
        id: 'pushup-func',
        name: 'Explosive Push-ups',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Flexão explosiva',
        targetMuscles: ['Peito', 'Tríceps'],
        caloriesPerMinute: 9,
      },
      {
        id: 'plank-walk',
        name: 'Plank Walk',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha com caminhada lateral',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 7,
      },
      {
        id: 'lunge-jump-func',
        name: 'Jump Lunges',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.lunge,
        videoUrl: EXERCISE_VIDEOS.lunge,
        description: 'Afundo com salto',
        targetMuscles: ['Pernas', 'Glúteos'],
        caloriesPerMinute: 11,
      },
      {
        id: 'burpee-func-2',
        name: 'Burpees',
        duration: 50,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Segunda série de burpees',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 12,
      },
      {
        id: 'squat-jump-func-2',
        name: 'Squat Jumps',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Segunda série de saltos',
        targetMuscles: ['Pernas', 'Glúteos'],
        caloriesPerMinute: 12,
      },
      {
        id: 'mountain-func-2',
        name: 'Mountain Climbers',
        duration: 50,
        imageUrl: EXERCISE_IMAGES.mountainClimber,
        videoUrl: EXERCISE_VIDEOS.mountainClimber,
        description: 'Segunda série de escalador',
        targetMuscles: ['Core', 'Ombros'],
        caloriesPerMinute: 11,
      },
      {
        id: 'pushup-func-2',
        name: 'Push-ups',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Segunda série de flexões',
        targetMuscles: ['Peito', 'Tríceps'],
        caloriesPerMinute: 9,
      },
      {
        id: 'plank-final-func',
        name: 'Plank Hold',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha final de resistência',
        targetMuscles: ['Core'],
        caloriesPerMinute: 5,
      },
      {
        id: 'cooldown-func',
        name: 'Cool Down',
        duration: 60,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Alongamento de desaquecimento',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 2,
      },
    ],
  },
  
  // CROSSFIT - Beginner
  {
    id: 'crossfit-intro',
    name: 'CrossFit Intro',
    description: 'Introdução ao CrossFit com movimentos básicos e intensidade moderada.',
    level: 'beginner',
    category: 'crossfit',
    imageUrl: WORKOUT_IMAGES.crossfit2,
    duration: 12,
    exerciseCount: 8,
    estimatedCalories: 150,
    isFeatured: false,
    exercises: [
      {
        id: 'squat-cf',
        name: 'Air Squat',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Agachamento sem peso',
        targetMuscles: ['Quadríceps', 'Glúteos'],
        caloriesPerMinute: 7,
      },
      {
        id: 'pushup-cf',
        name: 'Push-up',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Flexão básica',
        targetMuscles: ['Peito', 'Tríceps'],
        caloriesPerMinute: 7,
      },
      {
        id: 'jumping-cf',
        name: 'Jumping Jacks',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.jumpingJack,
        videoUrl: EXERCISE_VIDEOS.jumpingJack,
        description: 'Polichinelos',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 10,
      },
      {
        id: 'plank-cf',
        name: 'Plank',
        duration: 30,
        imageUrl: EXERCISE_IMAGES.plank,
        videoUrl: EXERCISE_VIDEOS.plank,
        description: 'Prancha isométrica',
        targetMuscles: ['Core'],
        caloriesPerMinute: 5,
      },
      {
        id: 'squat-cf-2',
        name: 'Air Squat',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.squat,
        videoUrl: EXERCISE_VIDEOS.squat,
        description: 'Segunda série de agachamento',
        targetMuscles: ['Quadríceps', 'Glúteos'],
        caloriesPerMinute: 7,
      },
      {
        id: 'pushup-cf-2',
        name: 'Push-up',
        duration: 35,
        imageUrl: EXERCISE_IMAGES.pushup,
        videoUrl: EXERCISE_VIDEOS.pushup,
        description: 'Segunda série de flexão',
        targetMuscles: ['Peito', 'Tríceps'],
        caloriesPerMinute: 7,
      },
      {
        id: 'burpee-cf',
        name: 'Burpees',
        duration: 40,
        imageUrl: EXERCISE_IMAGES.burpee,
        videoUrl: EXERCISE_VIDEOS.burpee,
        description: 'Burpees modificados',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 10,
      },
      {
        id: 'stretch-cf',
        name: 'Final Stretch',
        duration: 45,
        imageUrl: EXERCISE_IMAGES.downwardDog,
        videoUrl: EXERCISE_VIDEOS.downwardDog,
        description: 'Alongamento final',
        targetMuscles: ['Corpo inteiro'],
        caloriesPerMinute: 2,
      },
    ],
  },
];

// ============================================
// Service Functions
// ============================================

/**
 * Get all preset workouts
 */
export const getAllPresetWorkouts = async (): Promise<PresetWorkout[]> => {
  // Simulating API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return PRESET_WORKOUTS;
};

/**
 * Get featured workouts
 */
export const getFeaturedWorkouts = async (): Promise<PresetWorkout[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return PRESET_WORKOUTS.filter(w => w.isFeatured);
};

/**
 * Get workouts by level
 */
export const getWorkoutsByLevel = async (level: WorkoutLevel): Promise<PresetWorkout[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return PRESET_WORKOUTS.filter(w => w.level === level);
};

/**
 * Get workouts by category
 */
export const getWorkoutsByCategory = async (category: WorkoutCategory): Promise<PresetWorkout[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return PRESET_WORKOUTS.filter(w => w.category === category);
};

/**
 * Get workout by ID
 */
export const getWorkoutById = async (id: string): Promise<PresetWorkout | null> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return PRESET_WORKOUTS.find(w => w.id === id) || null;
};

/**
 * Filter workouts
 */
export const filterWorkouts = async (filters: WorkoutFilters): Promise<PresetWorkout[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return PRESET_WORKOUTS.filter(workout => {
    if (filters.level && workout.level !== filters.level) return false;
    if (filters.category && workout.category !== filters.category) return false;
    if (filters.minDuration && workout.duration < filters.minDuration) return false;
    if (filters.maxDuration && workout.duration > filters.maxDuration) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = workout.name.toLowerCase().includes(query);
      const matchesDesc = workout.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) return false;
    }
    return true;
  });
};

// ============================================
// Favorites Functions
// ============================================

/**
 * Get user's favorite workouts
 */
export const getFavoriteWorkouts = async (userId: string): Promise<FavoriteWorkout[]> => {
  try {
    const favorites = await storage.getItem<FavoriteWorkout>(FAVORITES_KEY);
    return favorites.filter(f => f.user_id === userId);
  } catch {
    return [];
  }
};

/**
 * Check if workout is favorited
 */
export const isWorkoutFavorited = async (userId: string, workoutId: string): Promise<boolean> => {
  const favorites = await getFavoriteWorkouts(userId);
  return favorites.some(f => f.workout_id === workoutId);
};

/**
 * Add workout to favorites
 */
export const addToFavorites = async (userId: string, workoutId: string): Promise<void> => {
  const existing = await isWorkoutFavorited(userId, workoutId);
  if (existing) return;
  
  const favorite: FavoriteWorkout = {
    id: generateUUID(),
    user_id: userId,
    workout_id: workoutId,
    created_at: new Date().toISOString(),
  };
  
  await storage.addItem(FAVORITES_KEY, favorite);
  await logAction({
    table: keyToTable(FAVORITES_KEY),
    action: 'insert',
    recordId: favorite.id,
    payload: favorite,
    userId,
  });
};

/**
 * Remove workout from favorites
 */
export const removeFromFavorites = async (userId: string, workoutId: string): Promise<void> => {
  const favorites = await getFavoriteWorkouts(userId);
  const favorite = favorites.find(f => f.workout_id === workoutId);
  if (favorite) {
    await storage.deleteItem(FAVORITES_KEY, favorite.id);
    await logAction({
      table: keyToTable(FAVORITES_KEY),
      action: 'delete',
      recordId: favorite.id,
      userId,
    });
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (userId: string, workoutId: string): Promise<boolean> => {
  const isFav = await isWorkoutFavorited(userId, workoutId);
  if (isFav) {
    await removeFromFavorites(userId, workoutId);
    return false;
  } else {
    await addToFavorites(userId, workoutId);
    return true;
  }
};

// ============================================
// Workout Sessions Functions
// ============================================

/**
 * Save completed workout session
 */
export const saveWorkoutSession = async (session: Omit<WorkoutSession, 'id'>): Promise<WorkoutSession> => {
  const newSession: WorkoutSession = {
    ...session,
    id: generateUUID(),
  };
  
  await storage.addItem(SESSIONS_KEY, newSession);
  await logAction({
    table: keyToTable(SESSIONS_KEY),
    action: 'insert',
    recordId: newSession.id,
    payload: newSession,
    userId: session.user_id,
  });
  return newSession;
};

/**
 * Get user's workout sessions
 */
export const getWorkoutSessions = async (userId: string): Promise<WorkoutSession[]> => {
  try {
    const sessions = await storage.getItem<WorkoutSession>(SESSIONS_KEY);
    return sessions
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
  } catch {
    return [];
  }
};

/**
 * Get total stats for user
 */
export const getUserWorkoutStats = async (userId: string): Promise<{
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  totalExercises: number;
}> => {
  const sessions = await getWorkoutSessions(userId);
  
  return {
    totalWorkouts: sessions.length,
    totalCalories: sessions.reduce((acc, s) => acc + s.calories_burned, 0),
    totalMinutes: sessions.reduce((acc, s) => acc + Math.floor(s.duration_seconds / 60), 0),
    totalExercises: sessions.reduce((acc, s) => acc + s.exercises_completed, 0),
  };
};

