import React, { useState } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Card, Button, Modal } from "@/components";
import { useData } from "@/hooks/useData";
import { useAlert } from "@/hooks/useAlert";

type MeasurementType =
   | "weight"
   | "height"
   | "chest"
   | "abdomen"
   | "waist"
   | "hip"
   | "bicep_left"
   | "bicep_right"
   | "thigh_left"
   | "thigh_right"
   | "calf_left"
   | "calf_right";

interface MeasurementOption {
   id: MeasurementType;
   label: string;
   icon: string;
   unit: string;
}

const measurementOptions: MeasurementOption[] = [
   { id: "weight", label: "Peso", icon: "scale", unit: "kg" },
   { id: "height", label: "Altura", icon: "accessibility-outline", unit: "cm" },
   { id: "chest", label: "Tórax", icon: "body", unit: "cm" },
   { id: "abdomen", label: "Abdômen", icon: "body", unit: "cm" },
   { id: "waist", label: "Cintura", icon: "ellipse", unit: "cm" },
   { id: "hip", label: "Quadril", icon: "ellipse-outline", unit: "cm" },
   { id: "bicep_left", label: "Bíceps E", icon: "barbell", unit: "cm" },
   { id: "bicep_right", label: "Bíceps D", icon: "barbell", unit: "cm" },
   { id: "thigh_left", label: "Coxa E", icon: "accessibility", unit: "cm" },
   { id: "thigh_right", label: "Coxa D", icon: "accessibility", unit: "cm" },
   { id: "calf_left", label: "Panturrilha E", icon: "walk", unit: "cm" },
   { id: "calf_right", label: "Panturrilha D", icon: "walk", unit: "cm" },
];

// Avatar SVG simples com cliques nas partes
const HumanAvatar: React.FC<{
   highlighted?: MeasurementType;
   onPartPress?: (part: MeasurementType) => void;
}> = ({ highlighted, onPartPress }) => {
   const getColor = (part: MeasurementType) =>
      highlighted === part ? colors.primary[400] : colors.text.tertiary;

   const handlePartPress = (part: MeasurementType) => {
      if (onPartPress) {
         onPartPress(part);
      }
   };

   return (
      <Svg width="200" height="400" viewBox="0 0 200 400">
         {/* Cabeça */}
         <Circle
            cx="100"
            cy="50"
            r="30"
            fill={colors.text.tertiary}
            opacity={0.3}
         />

         {/* Pescoço */}
         <Path
            d="M 90 80 L 110 80 L 110 100 L 90 100 Z"
            fill={colors.text.tertiary}
            opacity={0.3}
         />

         {/* Tórax (reduzido para acomodar abdômen) */}
         <Path
            d="M 75 95 L 125 95 L 135 140 L 65 140 Z"
            fill={getColor("chest")}
            opacity={0.5}
            stroke={getColor("chest")}
            strokeWidth="2"
            onPress={() => handlePartPress("chest")}
         />

         {/* Abdômen (faixa central em Path - largura ampliada) */}
         <Path
            d="M 66 140 L 135 140 L 122 158 L 80 158 Z"
            fill={getColor("abdomen")}
            opacity={0.5}
            stroke={getColor("abdomen")}
            strokeWidth="2"
            onPress={() => handlePartPress("abdomen")}
         />

         {/* Cintura (mais estreita que o abdômen) */}
         <Path
            d="M 79 158 L 121 158 L 118 185 L 82 185 Z"
            fill={getColor("waist")}
            opacity={0.5}
            stroke={getColor("waist")}
            strokeWidth="2"
            onPress={() => handlePartPress("waist")}
         />

         {/* Quadril (mantém proporção, levemente ajustado) */}
         <Path
            d="M 72 185 L 128 185 L 123 220 L 77 220 Z"
            fill={getColor("hip")}
            opacity={0.5}
            stroke={getColor("hip")}
            strokeWidth="2"
            onPress={() => handlePartPress("hip")}
         />

         {/* Braço Esquerdo */}
         <Path
            d="M 60 100 L 40 150 L 50 240 L 60 235"
            fill={getColor("bicep_left")}
            opacity={0.5}
            stroke={getColor("bicep_left")}
            strokeWidth="2"
            onPress={() => handlePartPress("bicep_left")}
         />

         {/* Braço Direito */}
         <Path
            d="M 140 100 L 160 150 L 150 240 L 140 235"
            fill={getColor("bicep_right")}
            opacity={0.5}
            stroke={getColor("bicep_right")}
            strokeWidth="2"
            onPress={() => handlePartPress("bicep_right")}
         />

         {/* Coxa Esquerda */}
         <Path
            d="M 75 220 L 75 300 L 90 300 L 90 220 Z"
            fill={getColor("thigh_left")}
            opacity={0.5}
            stroke={getColor("thigh_left")}
            strokeWidth="2"
            onPress={() => handlePartPress("thigh_left")}
         />

         {/* Coxa Direita */}
         <Path
            d="M 125 220 L 125 300 L 110 300 L 110 220 Z"
            fill={getColor("thigh_right")}
            opacity={0.5}
            stroke={getColor("thigh_right")}
            strokeWidth="2"
            onPress={() => handlePartPress("thigh_right")}
         />

         {/* Panturrilha Esquerda */}
         <Path
            d="M 75 300 L 75 360 L 90 360 L 90 300 Z"
            fill={getColor("calf_left")}
            opacity={0.5}
            stroke={getColor("calf_left")}
            strokeWidth="2"
            onPress={() => handlePartPress("calf_left")}
         />

         {/* Panturrilha Direita */}
         <Path
            d="M 125 300 L 125 360 L 110 360 L 110 300 Z"
            fill={getColor("calf_right")}
            opacity={0.5}
            stroke={getColor("calf_right")}
            strokeWidth="2"
            onPress={() => handlePartPress("calf_right")}
         />
      </Svg>
   );
};

export default function MeasurementsScreen() {
   const insets = useSafeAreaInsets();
   const { measurements, addMeasurement, getMeasurementHistory } = useData();
   const { showAlert } = useAlert();

   const [selectedType, setSelectedType] = useState<MeasurementType>("weight");
   const [modalVisible, setModalVisible] = useState(false);
   const [inputValue, setInputValue] = useState("");
   const [saving, setSaving] = useState(false);

   const selectedOption = measurementOptions.find(
      (opt) => opt.id === selectedType
   )!;
   const history = getMeasurementHistory(selectedType);
   const latestValue = history.length > 0 ? history[0].value : null;

   const handleAddMeasurement = async () => {
      const value = parseFloat(inputValue);
      if (isNaN(value) || value <= 0) {
         showAlert("Atenção", "Digite um valor válido");
         return;
      }

      try {
         setSaving(true);
         await addMeasurement(selectedType, value);
         showAlert("Sucesso", "Medida adicionada!");
         setModalVisible(false);
         setInputValue("");
      } catch (error) {
         showAlert("Erro", "Erro ao salvar medida");
      } finally {
         setSaving(false);
      }
   };
   const startEditingCurrent = () => {
      setInputValue(latestValue !== null ? String(latestValue) : "");
      setModalVisible(true);
   };

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
      });
   };

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <View style={styles.header}>
            <Text style={styles.title}>Peso e Medidas</Text>
         </View>

         <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
         >
            {/* Avatar 3D */}
            <View style={styles.avatarContainer}>
               <HumanAvatar
                  highlighted={
                     selectedType === "weight" ? undefined : selectedType
                  }
                  onPartPress={setSelectedType}
               />
               <TouchableOpacity
                  style={styles.currentValue}
                  onPress={startEditingCurrent}
               >
                  <Text style={styles.currentValueNumber}>
                     {latestValue !== null ? latestValue : ""}
                  </Text>
                  {latestValue === null && (
                     <Text style={styles.addText}>Adicionar</Text>
                  )}
                  <Text style={styles.currentValueUnit}>
                     {latestValue !== null && selectedOption.unit}
                  </Text>

                  <Ionicons
                     name={(latestValue ? "create-outline" : "add") as any}
                     size={26}
                     color={colors.primary[400]}
                     style={styles.editButton}
                  />
               </TouchableOpacity>
            </View>

            {/* Lista de Opções */}
            <View style={styles.optionsGrid}>
               {measurementOptions.map((option) => (
                  <TouchableOpacity
                     key={option.id}
                     style={[
                        styles.optionCard,
                        selectedType === option.id && styles.optionCardActive,
                     ]}
                     onPress={() => setSelectedType(option.id)}
                  >
                     <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={
                           selectedType === option.id
                              ? colors.primary[400]
                              : colors.text.secondary
                        }
                     />
                     <Text
                        style={[
                           styles.optionLabel,
                           selectedType === option.id &&
                              styles.optionLabelActive,
                        ]}
                     >
                        {option.label}
                     </Text>
                  </TouchableOpacity>
               ))}
            </View>

            {/* Histórico */}
            <View style={styles.historySection}>
               <Text style={styles.historyTitle}>Histórico</Text>
               {history.length === 0 ? (
                  <Card style={styles.emptyCard}>
                     <Text style={styles.emptyText}>
                        Nenhuma medida registrada
                     </Text>
                  </Card>
               ) : (
                  history.map((record) => (
                     <Card key={record.id} style={styles.historyCard}>
                        <View style={styles.historyRow}>
                           <Text style={styles.historyDate}>
                              {formatDate(record.date)}
                           </Text>
                           <Text style={styles.historyValue}>
                              {record.value} {selectedOption.unit}
                           </Text>
                        </View>
                     </Card>
                  ))
               )}
            </View>
         </ScrollView>

         {/* Modal Adicionar/Editar */}
         <Modal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title={`${latestValue !== null ? "Editar" : "Adicionar"} ${
               selectedOption.label
            }`}
         >
            <Text style={styles.modalLabel}>Valor ({selectedOption.unit})</Text>
            <TextInput
               style={styles.modalInput}
               value={inputValue}
               onChangeText={setInputValue}
               keyboardType="decimal-pad"
               placeholder="Digite o valor"
               placeholderTextColor={colors.text.tertiary}
               autoFocus
            />
            <View style={styles.modalActions}>
               <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
               />
               <Button
                  title="Salvar"
                  onPress={handleAddMeasurement}
                  loading={saving}
                  style={styles.modalButton}
               />
            </View>
         </Modal>
      </View>
   );
}

const styles = StyleSheet.create({
   header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.default,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
   },
   title: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   content: {
      padding: spacing.lg,
   },
   avatarContainer: {
      alignItems: "center",
      marginBottom: spacing.xl,
      position: "relative",
   },
   avatarTouchable: {
      cursor: "pointer",
   },
   currentValue: {
      position: "absolute",
      bottom: 20,
      backgroundColor: colors.background.card,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      flexDirection: "row",
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.primary[500],
      justifyContent: "center",
      alignItems: "center",
   },
   currentValueNumber: {
      fontSize: typography.fontSize["3xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
   },
   addText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
   },
   currentValueUnit: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginBottom: spacing.lg,
   },
   optionCard: {
      flex: 1,
      minWidth: "30%",
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: "center",
      gap: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.default,
   },
   optionCardActive: {
      borderColor: colors.primary[500],
      backgroundColor: colors.background.elevated,
   },
   optionLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: "center",
   },
   optionLabelActive: {
      color: colors.primary[400],
      fontWeight: typography.fontWeight.semibold,
   },
   addButton: {
      marginBottom: spacing.xl,
   },
   currentSection: {
      marginBottom: spacing.xl,
   },
   currentHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
   },
   currentTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
   },
   currentValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing.sm,
   },
   currentValueText: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[400],
   },
   currentDateText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   currentEmptyText: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   iconButton: {
      padding: spacing.xs,
      borderRadius: borderRadius.full,
   },
   editButton: {
      paddingLeft: spacing.sm,
      padding: spacing.xs,
      borderRadius: borderRadius.full,
   },
   editActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
   },
   inputInline: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.primary[500],
   },
   historySection: {
      marginBottom: spacing.xl,
   },
   historyTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
   },
   emptyCard: {
      alignItems: "center",
      paddingVertical: spacing.xl,
   },
   emptyText: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   historyCard: {
      marginBottom: spacing.sm,
      justifyContent: "space-between",
      alignItems: "center",
   },
   historyRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
   },
   historyDate: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      alignItems: "center",
   },
   historyValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
   },
   modalLabel: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
   },
   modalInput: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.primary[500],
      marginBottom: spacing.lg,
   },
   modalActions: {
      flexDirection: "row",
      gap: spacing.md,
   },
   modalButton: {
      flex: 1,
   },
});
