/**
 * FitTrack Configuration
 */

export const config = {
  // Sync settings
  sync: {
    autoSyncThresholdDays: 1,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Water intake settings
  water: {
    defaultGoalMl: 2000,
    quickAddAmounts: [200, 250, 500, 1000],
  },
  
  // Measurement types
  measurementTypes: [
    { key: 'peso', label: 'Peso', unit: 'kg' },
    { key: 'barriga', label: 'Barriga', unit: 'cm' },
    { key: 'cintura', label: 'Cintura', unit: 'cm' },
    { key: 'torax', label: 'Tórax', unit: 'cm' },
    { key: 'biceps_direito', label: 'Bíceps Direito', unit: 'cm' },
    { key: 'biceps_esquerdo', label: 'Bíceps Esquerdo', unit: 'cm' },
    { key: 'quadril', label: 'Quadril', unit: 'cm' },
    { key: 'coxa_direita', label: 'Coxa Direita', unit: 'cm' },
    { key: 'coxa_esquerda', label: 'Coxa Esquerda', unit: 'cm' },
    { key: 'panturrilha_direita', label: 'Panturrilha Direita', unit: 'cm' },
    { key: 'panturrilha_esquerda', label: 'Panturrilha Esquerda', unit: 'cm' },
  ],
  
  // Workout types
  workoutTypes: {
    musculacao: 'Musculação',
    aerobico: 'Aeróbico',
  },
};
