import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from '@/components';
import { AlertModal } from '@/components/ui/AlertModal';
import { colors, spacing, typography } from '@/constants/theme';
import { globalStyles } from '@/constants/styles';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets } from 'react-native-safe-area-context';

interface LoginViewProps {
  mode: 'login' | 'register';
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  isSyncing: boolean;
  insets: EdgeInsets;
  alertState: any; // Type from useAlert

  setName: (text: string) => void;
  setEmail: (text: string) => void;
  setPassword: (text: string) => void;
  setConfirmPassword: (text: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onSync: () => void;
  onToggleMode: () => void;
  onHideAlert: () => void;
}

export function LoginView({
  mode,
  name,
  email,
  password,
  confirmPassword,
  isLoading,
  isSyncing,
  insets,
  alertState,
  setName,
  setEmail,
  setPassword,
  setConfirmPassword,
  onLogin,
  onRegister,
  onSync,
  onToggleMode,
  onHideAlert,
}: LoginViewProps) {
  return (
    <KeyboardAvoidingView
      style={[globalStyles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="fitness" size={64} color={colors.primary[400]} />
          <Text style={styles.appName}>FitTrack</Text>
          <Text style={styles.tagline}>
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <Input
              label="Nome"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              icon={<Ionicons name="person-outline" size={20} color={colors.text.tertiary} />}
            />
          )}

          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />}
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
          />

          {mode === 'register' && (
            <Input
              label="Confirmar Senha"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />}
            />
          )}

          <Button
            title={mode === 'login' ? 'Entrar' : 'Criar Conta'}
            onPress={mode === 'login' ? onLogin : onRegister}
            loading={isLoading}
            style={styles.button}
          />

          <Button
            title="Restaurar Backup Local"
            onPress={onSync}
            loading={isSyncing}
            variant="outline"
            style={styles.button}
            icon={<Ionicons name="cloud-download-outline" size={18} color={colors.primary[400]} />}
          />

          <View style={styles.switchMode}>
            <Text style={styles.switchText}>
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </Text>
            <Button
              title={mode === 'login' ? 'Criar conta' : 'Fazer login'}
              variant="ghost"
              onPress={onToggleMode}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>

      <AlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        onClose={onHideAlert}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  appName: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
  switchMode: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  switchText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
});

