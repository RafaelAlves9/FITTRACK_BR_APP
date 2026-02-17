import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { initializeExercises } from '@/services/exercises';
import { devError } from '@/utils/logger';

export default function RootLayout() {
  useEffect(() => {
    // Initialize exercises database on app start
    const initExercises = async () => {
      try {
        await initializeExercises();
      } catch (error) {
        devError('Error initializing exercises:', error);
      }
    };
    
    initExercises();
  }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="day-summary" options={{ headerShown: false }} />
          <Stack.Screen name="custom-workouts" options={{ headerShown: false }} />
        </Stack>
      </DataProvider>
    </AuthProvider>
  );
}
