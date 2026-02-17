/**
 * Home Screen
 * Modern home with improved UI inspired by Gofit design
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card, DailyCheckModal, WaterModal } from "@/components";
import { useAuth } from "@/contexts/AuthContext";
import { devError } from "@/utils/logger";
import { useData } from "@/hooks/useData";
import {
  formatBrazilDate,
  getBrazilDayOfWeek,
  toBrazilDate,
} from "@/utils/dateUtils";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

function CelebrationOverlay({
  visible,
  onEnd,
}: {
  visible: boolean;
  onEnd: () => void;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const progress = useSharedValue(0);

  const startCelebration = () => {
    opacity.value = withTiming(1, { duration: 180 });
    scale.value = withSequence(withSpring(1.15), withSpring(1.0));
    progress.value = withTiming(
      1,
      { duration: 700, easing: Easing.out(Easing.quad) },
      () => {
        opacity.value = withDelay(
          300,
          withTiming(0, { duration: 220 }, () => runOnJS(onEnd)())
        );
      }
    );
  };

  useEffect(() => {
    if (visible) {
      startCelebration();
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const rays = Array.from({ length: 8 }) as unknown[] as number[];
  const rayStyles = rays.map((_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return useAnimatedStyle(() => {
      const radius = 140 * progress.value;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius;
      return {
        opacity: 1 - progress.value,
        transform: [
          { translateX: tx },
          { translateY: ty },
          { scale: 1 + progress.value },
        ],
      };
    });
  });

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {rayStyles.map((style, idx) => (
        <Animated.View
          key={`ray-${idx}`}
          style={[
            {
              position: "absolute",
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary[400],
            },
            style as any,
          ]}
        />
      ))}
      <Animated.View
        style={[
          {
            width: 200,
            height: 200,
            borderRadius: 100,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          },
          containerStyle as any,
        ]}
      >
        <LinearGradient
          colors={colors.gradients.primary as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ ...StyleSheet.absoluteFillObject }}
        />
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="trophy" size={64} color="#fff" />
          <Text
            style={{
              color: "#fff",
              marginTop: spacing.xs,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            Daily Check!
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { todayChecks, todayWater, loading } = useData();
  const todayBrazil = toBrazilDate(new Date());
  const todayCheck = todayChecks && todayChecks.length > 0 ? todayChecks[0] : null;
  const isDailyCheckToday = !!(todayCheck && todayCheck.date === todayBrazil);
  const todayWaterAmount =
    todayWater && todayWater.date === todayBrazil ? todayWater.amount_ml : 0;

  const [dailyCheckVisible, setDailyCheckVisible] = useState(false);
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({ username: "" });
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const prevCompletedRef = useRef<boolean>(!!todayCheck);

  const handleDailyCheckCompleted = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setCelebrationVisible(true);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    const completed = isDailyCheckToday;
    if (completed && !prevCompletedRef.current) {
      handleDailyCheckCompleted();
    }
    prevCompletedRef.current = completed;
  }, [todayCheck]);

  const loadProfile = async () => {
    if (user) {
      try {
        const { getUserProfile } = await import("@/services/profile");
        const profile = await getUserProfile(user.id);
        if (profile) {
          setProfileData({ username: profile.username });
        }
      } catch (error) {
        devError("Error loading profile:", error);
      }
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const moduleCards = [
    {
      id: "daily-check",
      title: "Daily Check",
      subtitle: isDailyCheckToday
        ? "Concluído hoje!"
        : "Marcar treino do dia",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
          <Ionicons name="checkbox" size={24} color={colors.success} />
        </View>
      ),
      onPress: () => setDailyCheckVisible(true),
      completed: isDailyCheckToday,
    },
    {
      id: "workouts",
      title: "Treinos",
      subtitle: "Meus treinos personalizados",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary[500]}20` }]}>
          <Ionicons name="barbell" size={24} color={colors.primary[400]} />
        </View>
      ),
      onPress: () => router.push("/custom-workouts"),
    },
    {
      id: "diet",
      title: "Dieta",
      subtitle: "Registrar refeições",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
          <Ionicons name="restaurant" size={24} color={colors.warning} />
        </View>
      ),
      onPress: () => router.push("/(tabs)/diet"),
    },
    {
      id: "water",
      title: "Água",
      subtitle: todayWaterAmount
        ? `${todayWaterAmount} ml hoje`
        : "Registrar consumo",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.info}20` }]}>
          <Ionicons name="water" size={24} color={colors.info} />
        </View>
      ),
      onPress: () => setWaterModalVisible(true),
    },
    {
      id: "measurements",
      title: "Peso e Medidas",
      subtitle: "Acompanhar evolução",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary[500]}20` }]}>
          <Ionicons name="body" size={24} color={colors.secondary[400]} />
        </View>
      ),
      onPress: () => router.push("/(tabs)/measurements"),
    },
    {
      id: "calendar",
      title: "Calendário",
      subtitle: "Histórico completo",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.accent[500]}20` }]}>
          <Ionicons name="calendar" size={24} color={colors.accent[400]} />
        </View>
      ),
      onPress: () => router.push("/(tabs)/calendar"),
    },
    {
      id: "summary",
      title: "Resumo do Dia",
      subtitle: "Ver estatísticas",
      icon: (
        <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
          <Ionicons name="stats-chart" size={24} color={colors.error} />
        </View>
      ),
      onPress: () => router.push("/(tabs)/summary"),
    },
  ];

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIcon}>
            <Ionicons name="barbell" size={20} color={colors.text.primary} />
          </View>
          <Text style={styles.logoText}>FitTrack</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person-circle-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {getGreeting()}, {profileData.username || user?.email?.split('@')[0] || "Atleta"} 👋
          </Text>
          <Text style={styles.dateText}>
            {getBrazilDayOfWeek()}, {formatBrazilDate(new Date().toISOString())}
          </Text>
        </View>

        {/* Module Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menu Rápido</Text>
          <View style={styles.grid}>
            {moduleCards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                subtitle={card.subtitle}
                icon={card.icon}
                onPress={card.onPress}
                completed={card.completed}
                style={styles.card}
                variant="elevated"
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <DailyCheckModal
        visible={dailyCheckVisible}
        onClose={() => setDailyCheckVisible(false)}
      />

      <WaterModal
        visible={waterModalVisible}
        onClose={() => setWaterModalVisible(false)}
      />

      <CelebrationOverlay
        visible={celebrationVisible}
        onEnd={() => setCelebrationVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerRight: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  greeting: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greetingText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textTransform: "capitalize",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 2,
    height: 100,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  statGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  miniStats: {
    flex: 1,
    gap: spacing.sm,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    ...shadows.sm,
  },
  miniStatValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  miniStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
