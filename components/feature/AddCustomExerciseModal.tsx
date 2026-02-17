import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Modal, Button } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { musculationCategories, aerobicCategories } from '@/constants/exercises';

type ExerciseType = 'musculacao' | 'aerobico';

interface AddCustomExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  defaultType?: ExerciseType;
  onSave: (payload: { 
    name: string; 
    type: ExerciseType; 
    category: string;
    calories_per_hour?: number; 
    calories_per_12_reps?: number;
  }) => Promise<void> | void;
}

export const AddCustomExerciseModal: React.FC<AddCustomExerciseModalProps> = ({ visible, onClose, defaultType = 'musculacao', onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>(defaultType);
  const [category, setCategory] = useState<string>('Personalizado');
  const [calories, setCalories] = useState('');
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => {
    return type === 'musculacao' ? ['Personalizado', ...musculationCategories] : ['Personalizado', ...aerobicCategories];
  }, [type]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      
      const calValue = calories ? parseFloat(calories.replace(',', '.')) : undefined;
      const payload: any = { name: name.trim(), type, category };
      
      if (calValue) {
          if (type === 'musculacao') {
              payload.calories_per_12_reps = calValue;
          } else {
              payload.calories_per_hour = calValue;
          }
      }

      await onSave(payload);
      setName('');
      setCategory('Personalizado');
      setCalories('');
      setType(defaultType);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Adicionar Exercício">
      <View style={styles.field}>
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, type === 'musculacao' && styles.segmentBtnActive]}
            onPress={() => setType('musculacao')}
          >
            <Text style={[styles.segmentText, type === 'musculacao' && styles.segmentTextActive]}>Musculação</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, type === 'aerobico' && styles.segmentBtnActive]}
            onPress={() => setType('aerobico')}
          >
            <Text style={[styles.segmentText, type === 'aerobico' && styles.segmentTextActive]}>Aeróbico</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do exercício</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Supino com halteres"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriesRow}>
          {categoryOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.catChip, category === opt && styles.catChipActive]}
              onPress={() => setCategory(opt)}
            >
              <Text style={[styles.catChipText, category === opt && styles.catChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
            {type === 'musculacao' ? 'Calorias (por 12 repetições)' : 'Calorias (por hora)'}
        </Text>
        <TextInput
          style={styles.input}
          value={calories}
          onChangeText={setCalories}
          placeholder="Opcional"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.actions}>
        <Button title="Cancelar" variant="outline" onPress={onClose} style={styles.button} />
        <Button title="Salvar" onPress={handleSave} loading={saving} style={styles.button} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: colors.background.card,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  segmentBtnActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  segmentText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  segmentTextActive: {
    color: colors.primary[400],
    fontWeight: typography.fontWeight.semibold,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  catChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  catChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.elevated,
  },
  catChipText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  catChipTextActive: {
    color: colors.primary[400],
    fontWeight: typography.fontWeight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});


