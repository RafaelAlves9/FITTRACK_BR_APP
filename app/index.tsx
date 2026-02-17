import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/constants/theme';
import { getUserProfile } from '@/services/profile';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [navigated, setNavigated] = useState(false);

  const handleRedirect = async () => {
    if (loading || navigated) return;

    if (!user) {
      router.replace('/login');
      setNavigated(true);
      return;
    }

    const profile = await getUserProfile(user.id);
    const onboardingDone = profile?.onboarding_completed;

    if (onboardingDone) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
    setNavigated(true);
  };

  useEffect(() => {
    handleRedirect();
  }, [user, loading, navigated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary[400]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});
