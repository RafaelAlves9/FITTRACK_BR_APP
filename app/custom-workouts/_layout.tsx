/**
 * Custom Workouts Layout
 * Stack navigation for custom workouts screens
 */

import { Stack } from 'expo-router';

export default function CustomWorkoutsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="detail" options={{ headerShown: false }} />
      <Stack.Screen name="add-exercises" options={{ headerShown: false }} />
      <Stack.Screen name="exercise" options={{ headerShown: false }} />
      <Stack.Screen name="exercise-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

