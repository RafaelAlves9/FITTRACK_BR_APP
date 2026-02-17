import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAlert } from '@/hooks/useAlert';

interface DietAIModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DietAIModal: React.FC<DietAIModalProps> = ({ visible, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!visible) {
      setDescription('');
    }
  }, [visible]);

  const handleUseAI = () => {
    const trimmed = description.trim();
    if (!trimmed) {
      showAlert('Descrição vazia', 'Digite uma descrição do alimento/refeição.');
      return;
    }
    onClose();
    router.push({
      pathname: '/meal-create',
      params: { ai: '1', prompt: trimmed, onSuccess: onSuccess ? 'true' : 'false' },
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Assistente de IA">
      <Text style={styles.subtitle}>
        Descreva o alimento/refeição. Ex.: “200g de frango grelhado com arroz e salada”
      </Text>
      <TextInput
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Digite sua descrição aqui..."
        placeholderTextColor={colors.text.tertiary}
        style={styles.textarea}
        textAlignVertical="top"
        autoFocus
      />
      <View style={styles.actions}>
        <Button title="Cancelar" variant="outline" onPress={onClose} style={styles.button} />
        <Button title="Utilizar IA" onPress={handleUseAI} style={styles.button} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});


