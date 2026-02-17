/**
 * Exercise Catalogs - Offline-first data
 * Catálogos de exercícios de musculação e aeróbico
 */

export interface Exercise {
  id: string;
  name: string;
  category: string;
  type: 'musculacao' | 'aerobico';
  caloriesPerHour?: number; // Para aeróbicos (UI legacy)
  caloriesPer12Reps?: number; // Para musculação (UI legacy)
  calories_per_hour?: number; // DB snake_case
  calories_per_12_reps?: number; // DB snake_case
  image?: string; // URL ou require path
  muscle?: string; // Músculo principal trabalhado
}

// Catálogo de Exercícios de Musculação
export const musculationExercises: Exercise[] = [
  // PEITO
  { id: 'bench-press', name: 'Supino Reto', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 25, muscle: 'Peitoral' },
  { id: 'incline-bench', name: 'Supino Inclinado', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 24, muscle: 'Peitoral Superior' },
  { id: 'decline-bench', name: 'Supino Declinado', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 23, muscle: 'Peitoral Inferior' },
  { id: 'chest-fly', name: 'Crucifixo', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 20, muscle: 'Peitoral' },
  { id: 'cable-crossover', name: 'Crossover', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 18, muscle: 'Peitoral' },
  { id: 'push-ups', name: 'Flexão', category: 'Peito', type: 'musculacao', caloriesPer12Reps: 15, muscle: 'Peitoral' },
  
  // COSTAS
  { id: 'deadlift', name: 'Levantamento Terra', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 35, muscle: 'Lombar' },
  { id: 'barbell-row', name: 'Remada Curvada', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 28, muscle: 'Dorsais' },
  { id: 'lat-pulldown', name: 'Puxada Frontal', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 25, muscle: 'Dorsais' },
  { id: 'seated-row', name: 'Remada Sentada', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 24, muscle: 'Dorsais' },
  { id: 'pull-ups', name: 'Barra Fixa', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 30, muscle: 'Dorsais' },
  { id: 't-bar-row', name: 'Remada T-Bar', category: 'Costas', type: 'musculacao', caloriesPer12Reps: 26, muscle: 'Dorsais' },
  
  // OMBROS
  { id: 'military-press', name: 'Desenvolvimento Militar', category: 'Ombros', type: 'musculacao', caloriesPer12Reps: 27, muscle: 'Deltoides' },
  { id: 'lateral-raise', name: 'Elevação Lateral', category: 'Ombros', type: 'musculacao', caloriesPer12Reps: 18, muscle: 'Deltoide Lateral' },
  { id: 'front-raise', name: 'Elevação Frontal', category: 'Ombros', type: 'musculacao', caloriesPer12Reps: 17, muscle: 'Deltoide Anterior' },
  { id: 'rear-delt-fly', name: 'Crucifixo Inverso', category: 'Ombros', type: 'musculacao', caloriesPer12Reps: 16, muscle: 'Deltoide Posterior' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Ombros', type: 'musculacao', caloriesPer12Reps: 26, muscle: 'Deltoides' },
  
  // BÍCEPS
  { id: 'barbell-curl', name: 'Rosca Direta', category: 'Bíceps', type: 'musculacao', caloriesPer12Reps: 20, muscle: 'Bíceps' },
  { id: 'hammer-curl', name: 'Rosca Martelo', category: 'Bíceps', type: 'musculacao', caloriesPer12Reps: 19, muscle: 'Bíceps/Braquial' },
  { id: 'preacher-curl', name: 'Rosca Scott', category: 'Bíceps', type: 'musculacao', caloriesPer12Reps: 18, muscle: 'Bíceps' },
  { id: 'concentration-curl', name: 'Rosca Concentrada', category: 'Bíceps', type: 'musculacao', caloriesPer12Reps: 17, muscle: 'Bíceps' },
  
  // TRÍCEPS
  { id: 'close-grip-bench', name: 'Supino Fechado', category: 'Tríceps', type: 'musculacao', caloriesPer12Reps: 24, muscle: 'Tríceps' },
  { id: 'tricep-dips', name: 'Mergulho', category: 'Tríceps', type: 'musculacao', caloriesPer12Reps: 26, muscle: 'Tríceps' },
  { id: 'overhead-extension', name: 'Tríceps Testa', category: 'Tríceps', type: 'musculacao', caloriesPer12Reps: 19, muscle: 'Tríceps' },
  { id: 'tricep-pushdown', name: 'Tríceps Pulley', category: 'Tríceps', type: 'musculacao', caloriesPer12Reps: 18, muscle: 'Tríceps' },
  
  // PERNAS
  { id: 'squat', name: 'Agachamento', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 32, muscle: 'Quadríceps' },
  { id: 'leg-press', name: 'Leg Press', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 30, muscle: 'Quadríceps' },
  { id: 'leg-extension', name: 'Cadeira Extensora', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 22, muscle: 'Quadríceps' },
  { id: 'leg-curl', name: 'Mesa Flexora', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 21, muscle: 'Posteriores' },
  { id: 'lunges', name: 'Afundo', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 28, muscle: 'Quadríceps/Glúteos' },
  { id: 'calf-raise', name: 'Panturrilha em Pé', category: 'Pernas', type: 'musculacao', caloriesPer12Reps: 16, muscle: 'Panturrilha' },
  
  // ABDÔMEN
  { id: 'crunches', name: 'Abdominal Crunch', category: 'Abdômen', type: 'musculacao', caloriesPer12Reps: 12, muscle: 'Abdômen' },
  { id: 'plank', name: 'Prancha', category: 'Abdômen', type: 'musculacao', caloriesPer12Reps: 10, muscle: 'Core' },
  { id: 'leg-raises', name: 'Elevação de Pernas', category: 'Abdômen', type: 'musculacao', caloriesPer12Reps: 14, muscle: 'Abdômen Inferior' },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Abdômen', type: 'musculacao', caloriesPer12Reps: 13, muscle: 'Oblíquos' },
];

// Catálogo de Exercícios Aeróbicos/Cardio
export const aerobicExercises: Exercise[] = [
  { id: 'running', name: 'Corrida', category: 'Cardio', type: 'aerobico', caloriesPerHour: 600 },
  { id: 'walking', name: 'Caminhada', category: 'Cardio', type: 'aerobico', caloriesPerHour: 280 },
  { id: 'cycling', name: 'Ciclismo', category: 'Cardio', type: 'aerobico', caloriesPerHour: 500 },
  { id: 'swimming', name: 'Natação', category: 'Cardio', type: 'aerobico', caloriesPerHour: 550 },
  { id: 'jump-rope', name: 'Pular Corda', category: 'Cardio', type: 'aerobico', caloriesPerHour: 700 },
  { id: 'elliptical', name: 'Elíptico', category: 'Cardio', type: 'aerobico', caloriesPerHour: 450 },
  { id: 'rowing', name: 'Remo', category: 'Cardio', type: 'aerobico', caloriesPerHour: 520 },
  { id: 'stair-climber', name: 'Escada', category: 'Cardio', type: 'aerobico', caloriesPerHour: 480 },
  { id: 'hiit', name: 'HIIT', category: 'Cardio', type: 'aerobico', caloriesPerHour: 800 },
  { id: 'spinning', name: 'Spinning', category: 'Cardio', type: 'aerobico', caloriesPerHour: 650 },
  { id: 'boxing', name: 'Boxe', category: 'Cardio', type: 'aerobico', caloriesPerHour: 720 },
  { id: 'dance', name: 'Dança', category: 'Cardio', type: 'aerobico', caloriesPerHour: 400 },
  { id: 'soccer', name: 'Futebol', category: 'Esporte', type: 'aerobico', caloriesPerHour: 600 },
  { id: 'basketball', name: 'Basquete', category: 'Esporte', type: 'aerobico', caloriesPerHour: 550 },
  { id: 'tennis', name: 'Tênis', category: 'Esporte', type: 'aerobico', caloriesPerHour: 500 },
  { id: 'volleyball', name: 'Vôlei', category: 'Esporte', type: 'aerobico', caloriesPerHour: 400 },
];

// Helper para buscar exercício por ID
export const getExerciseById = (id: string): Exercise | undefined => {
  return [...musculationExercises, ...aerobicExercises].find(ex => ex.id === id);
};

// Helper para categorias de musculação
export const musculationCategories = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Abdômen',
];

// Helper para categorias de aeróbico
export const aerobicCategories = [
  'Cardio',
  'Esporte',
];
