/**
 * Alert Modal Component - Cross-platform alert system
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { colors, spacing, typography } from '@/constants/theme';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertModalProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onClose,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title} showCloseButton={false}>
      {message && <Text style={styles.message}>{message}</Text>}
      
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            title={button.text}
            onPress={() => handleButtonPress(button)}
            variant={button.style === 'destructive' ? 'outline' : button.style === 'cancel' ? 'ghost' : 'primary'}
            style={styles.button}
          />
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  buttonContainer: {
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});
