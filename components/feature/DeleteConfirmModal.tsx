import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false,
}) => {
  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="warning"
            size={48}
            color={colors.error}
          />
        </View>

        <Text style={styles.message}>{message}</Text>
        
        {itemName && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>"{itemName}"</Text>
          </View>
        )}

        <Text style={styles.warning}>
          Esta ação não pode ser desfeita.
        </Text>

        <View style={styles.actions}>
          <Button
            title="Cancelar"
            variant="outline"
            onPress={onClose}
            style={styles.button}
            disabled={loading}
          />
          <Button
            title={loading ? "Excluindo..." : "Excluir"}
            onPress={onConfirm}
            disabled={loading}
            style={[styles.button, styles.deleteButton]}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  itemContainer: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  warning: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
});