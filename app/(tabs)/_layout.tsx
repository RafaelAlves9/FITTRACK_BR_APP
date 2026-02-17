import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.border.default,
          height: Platform.select({
            ios: insets.bottom + 60,
            android: insets.bottom + 60,
            default: 70,
          }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: insets.bottom + 8,
            android: insets.bottom + 8,
            default: 8,
          }),
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      {/* Hidden tabs - accessible only via navigation */}
      <Tabs.Screen
        name="workouts"
        options={{
          href: null,
          title: 'Treinos',
        }}
      />
      <Tabs.Screen
        name="diet"
        options={{
          href: null,
          title: 'Dieta',
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          href: null,
          title: 'Medidas',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
          title: 'Calendário',
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          href: null,
          title: 'Resumo',
        }}
      />
    </Tabs>
  );
}
