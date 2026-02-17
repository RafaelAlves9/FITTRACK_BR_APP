import React, { useState, useEffect } from "react";
import {
   View,
   Text,
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   TextInput,
   ActivityIndicator,
   Image,
   Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { globalStyles } from "@/constants/styles";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
   getUserProfile,
   updateUserProfile,
   saveAvatarImage,
   deleteAvatarImage,
   syncUserProfileToBackend,
} from "@/services/profile";
import { syncPushData } from "@/services/sync";
import {
   createBackup,
   importBackupFromFile,
   shareLastBackup,
   getLastBackupInfo,
   type BackupInfo,
} from "@/services/backup";
import { useAlert } from "@/hooks/useAlert";
import { devLog, devWarn, devError } from "@/utils/logger";

export default function ProfileScreen() {
   const { user, signOut } = useAuth();
   const { showAlert } = useAlert();
   const router = useRouter();
   const insets = useSafeAreaInsets();

   const [editing, setEditing] = useState(false);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [uploadingPhoto, setUploadingPhoto] = useState(false);
   const [backingUp, setBackingUp] = useState(false);
   const [restoring, setRestoring] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [lastBackup, setLastBackup] = useState<BackupInfo | null>(null);

   const [profileData, setProfileData] = useState({
      username: "",
      phone: "",
      avatar_uri: "",
      gender: "",
      age: null as number | null,
   });

   const [editData, setEditData] = useState({
      username: "",
      phone: "",
      gender: "",
      age: "",
   });

   const formatPhoneBr = (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 2) return `(${digits}`;
      if (digits.length <= 6)
         return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 10)
         return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
            6,
         )}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
         7,
         11,
      )}`;
   };

   useEffect(() => {
      loadProfile();
      loadLastBackupInfo();
   }, [user]);

   const loadLastBackupInfo = async () => {
      try {
         const info = await getLastBackupInfo();
         setLastBackup(info);
      } catch (error) {
         devError("Error loading backup info:", error);
      }
   };

   const loadProfile = async () => {
      if (!user) {
         setLoading(false);
         return;
      }

      try {
         setLoading(true);
         devLog("📋 Loading profile for user:", user.id);

         const profile = await getUserProfile(user.id);
         devLog("📋 Profile loaded:", profile);

         if (profile) {
            setProfileData({
               username: profile.username || "",
               phone: profile.phone || "",
               avatar_uri: profile.avatar_uri || "",
               gender: profile.gender || "",
               age: profile.age ?? null,
            });
            setEditData({
               username: profile.username || "",
               phone: profile.phone || "",
               gender: profile.gender || "",
               age: profile.age ? String(profile.age) : "",
            });
         }
      } catch (error) {
         devError("❌ Error loading profile:", error);
         showAlert("Erro", "Falha ao carregar perfil");
      } finally {
         setLoading(false);
      }
   };

   const handleSelectPhoto = async () => {
      try {
         devLog("📸 Opening photo picker...");

         const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

         if (permissionResult.status !== "granted") {
            showAlert(
               "Permissão Negada",
               "Precisamos de acesso à galeria para alterar a foto de perfil.",
            );
            return;
         }

         const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
         });

         devLog("📸 Picker result:", {
            canceled: result.canceled,
            hasAssets: !!result.assets,
         });

         if (!result.canceled && result.assets?.[0]) {
            await uploadPhoto(
               result.assets[0].uri,
               (result.assets[0] as any).assetId,
            );
         }
      } catch (error: any) {
         devError("❌ Error selecting photo:", error);
         showAlert("Erro", `Falha ao selecionar foto: ${error.message}`);
      }
   };

   const uploadPhoto = async (uri: string, assetId?: string) => {
      if (!user) return;

      try {
         setUploadingPhoto(true);
         devLog("📤 Uploading photo:", uri);

         // Save new avatar first (safer), then cleanup old on success
         const newAvatarUri = await saveAvatarImage(user.id, uri, assetId);
         devLog("✅ Avatar saved:", newAvatarUri);

         // Update profile
         await updateUserProfile(user.id, { avatar_uri: newAvatarUri }, true);

         // Sync to backend
         const updatedProfile = await getUserProfile(user.id);
         if (updatedProfile) {
            try {
               await syncUserProfileToBackend(updatedProfile);
            } catch (syncError) {
               devWarn("⚠️ Failed to sync avatar to backend:", syncError);
               // We don't block the UI flow, but we warn (local data is updated)
            }
         }

         setProfileData((prev) => ({ ...prev, avatar_uri: newAvatarUri }));

         // Best-effort: delete old avatar after successful update
         if (profileData.avatar_uri) {
            try {
               devLog("🗑️ Deleting old avatar:", profileData.avatar_uri);
               await deleteAvatarImage(profileData.avatar_uri);
            } catch (cleanupErr) {
               devWarn("Cleanup old avatar failed:", cleanupErr);
            }
         }
         showAlert("Sucesso", "Foto de perfil atualizada!");
      } catch (error: any) {
         devError("❌ Error uploading photo:", error);
         showAlert("Erro", error.message || "Falha ao fazer upload da foto");
      } finally {
         setUploadingPhoto(false);
      }
   };

   const handleSave = async () => {
      if (!user) return;

      try {
         const parsedAge =
            editData.age.trim().length > 0
               ? parseInt(editData.age.trim(), 10)
               : null;

         if (
            editData.age &&
            (isNaN(parsedAge as number) || (parsedAge ?? 0) <= 0)
         ) {
            showAlert("Erro", "Informe uma idade válida");
            return;
         }

         setSaving(true);
         devLog("💾 Saving profile:", editData);

         await updateUserProfile(
            user.id,
            {
               username: editData.username.trim(),
               phone: editData.phone.trim(),
               gender: editData.gender,
               age: parsedAge,
            },
            true,
         );

         // Sync to backend
         const updatedProfile = await getUserProfile(user.id);
         if (updatedProfile) {
            await syncUserProfileToBackend(updatedProfile);
         }

         setProfileData((prev) => ({
            ...prev,
            username: editData.username.trim(),
            phone: editData.phone.trim(),
            gender: editData.gender,
            age: parsedAge,
         }));

         setEditing(false);
         showAlert("Sucesso", "Perfil atualizado com sucesso!");
         devLog("✅ Profile saved successfully");
      } catch (error: any) {
         devError("❌ Error saving profile:", error);
         showAlert("Erro", error.message || "Falha ao salvar perfil");
      } finally {
         setSaving(false);
      }
   };

   const handleCancel = () => {
      setEditData({
         username: profileData.username,
         phone: profileData.phone,
         gender: profileData.gender,
         age: profileData.age ? String(profileData.age) : "",
      });
      setEditing(false);
   };

   const handleLogout = async () => {
      try {
         setIsLoggingOut(true);
         // Tenta sincronizar antes de sair (forçado)
         await syncPushData(true);
      } catch (error) {
         devError("Erro na sincronização pré-logout:", error);
         // Não impede o logout se a sincronização falhar
      } finally {
         await signOut();
         router.replace("/login");
         setIsLoggingOut(false);
      }
   };

   const handleBackup = async () => {
      if (!user || !user.email) {
         showAlert("Erro", "Usuário não encontrado. Faça login novamente.");
         return;
      }

      try {
         setBackingUp(true);

         const result = await createBackup(user.email);

         if (result.success) {
            const sizeInKB = ((result.size || 0) / 1024).toFixed(2);
            showAlert(
               "Backup Criado!",
               `Seus dados foram salvos com sucesso!\nTamanho: ${sizeInKB} KB\n\nO backup foi salvo no dispositivo e pode ser compartilhado ou restaurado a qualquer momento.`,
            );
            await loadLastBackupInfo();

            // Perguntar se quer compartilhar
            setTimeout(() => {
               showAlert(
                  "Compartilhar Backup?",
                  "Deseja compartilhar o arquivo de backup para salvá-lo em outro lugar (email, drive, etc)?",
                  [
                     { text: "Não", style: "cancel" },
                     {
                        text: "Sim",
                        onPress: async () => {
                           const shareResult = await shareLastBackup();
                           if (
                              !shareResult.success &&
                              shareResult.error !==
                                 "Compartilhamento não disponível neste dispositivo"
                           ) {
                              showAlert(
                                 "Erro",
                                 shareResult.error || "Falha ao compartilhar",
                              );
                           }
                        },
                     },
                  ],
               );
            }, 500);
         } else {
            showAlert("Erro", result.error || "Falha ao criar backup");
         }
      } catch (error: any) {
         devError("Error creating backup:", error);
         showAlert("Erro", error.message || "Falha ao criar backup");
      } finally {
         setBackingUp(false);
      }
   };

   const handleRestore = async () => {
      try {
         setRestoring(true);

         const result = await importBackupFromFile();

         if (result.success) {
            showAlert(
               "Backup Restaurado!",
               `${result.items_restored} itens foram restaurados com sucesso!\n\nO app será recarregado para aplicar as mudanças.`,
            );

            // Recarregar perfil após restauração
            setTimeout(() => {
               loadProfile();
               loadLastBackupInfo();
            }, 1000);
         } else if (result.error !== "Seleção cancelada") {
            showAlert("Erro", result.error || "Falha ao restaurar backup");
         }
      } catch (error: any) {
         devError("Error restoring backup:", error);
         showAlert("Erro", error.message || "Falha ao restaurar backup");
      } finally {
         setRestoring(false);
      }
   };

   const handleShare = async () => {
      try {
         const result = await shareLastBackup();
         if (!result.success) {
            showAlert("Erro", result.error || "Falha ao compartilhar backup");
         }
      } catch (error: any) {
         devError("Error sharing backup:", error);
         showAlert("Erro", error.message || "Falha ao compartilhar backup");
      }
   };

   if (loading) {
      return (
         <View
            style={[
               globalStyles.container,
               {
                  paddingTop: insets.top,
                  justifyContent: "center",
                  alignItems: "center",
               },
            ]}
         >
            <ActivityIndicator size="large" color={colors.primary[400]} />
         </View>
      );
   }

   return (
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
         <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
               <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={handleSelectPhoto}
                  disabled={uploadingPhoto}
               >
                  {profileData.avatar_uri ? (
                     <Image
                        source={{ uri: profileData.avatar_uri }}
                        style={styles.avatar}
                     />
                  ) : (
                     <View style={styles.avatarPlaceholder}>
                        <Ionicons
                           name="person"
                           size={64}
                           color={colors.primary[400]}
                        />
                     </View>
                  )}
                  {uploadingPhoto && (
                     <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="small" color="#fff" />
                     </View>
                  )}
                  <View style={styles.cameraIcon}>
                     <Ionicons name="camera" size={20} color="#fff" />
                  </View>
               </TouchableOpacity>

               {!editing ? (
                  <>
                     <Text style={styles.name}>
                        {profileData.username || "Sem nome"}
                     </Text>
                     <Text style={styles.email}>{user?.email}</Text>
                     {profileData.phone && (
                        <Text style={styles.phone}>{profileData.phone}</Text>
                     )}
                     <View style={styles.metaRow}>
                        {profileData.age ? (
                           <Text style={styles.metaText}>
                              {profileData.age} anos
                           </Text>
                        ) : null}
                        {profileData.gender ? (
                           <Text style={styles.metaText}>
                              {profileData.gender === "male"
                                 ? "Masculino"
                                 : profileData.gender === "female"
                                   ? "Feminino"
                                   : "Outro"}
                           </Text>
                        ) : null}
                     </View>
                  </>
               ) : null}
            </View>

            {editing ? (
               <View style={styles.editSection}>
                  <View style={styles.inputGroup}>
                     <Text style={styles.label}>Nome</Text>
                     <TextInput
                        style={styles.input}
                        value={editData.username}
                        onChangeText={(text) =>
                           setEditData((prev) => ({ ...prev, username: text }))
                        }
                        placeholder="Digite seu nome"
                        placeholderTextColor={colors.text.tertiary}
                     />
                  </View>

                  <View style={styles.inputGroup}>
                     <Text style={styles.label}>Celular</Text>
                     <TextInput
                        style={styles.input}
                        value={editData.phone}
                        onChangeText={(text) =>
                           setEditData((prev) => ({
                              ...prev,
                              phone: formatPhoneBr(text),
                           }))
                        }
                        placeholder="Digite seu celular"
                        placeholderTextColor={colors.text.tertiary}
                        keyboardType="phone-pad"
                        maxLength={16}
                     />
                  </View>

                  <View style={styles.rowGroup}>
                     <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Idade</Text>
                        <TextInput
                           style={styles.input}
                           value={editData.age}
                           onChangeText={(text) =>
                              setEditData((prev) => ({
                                 ...prev,
                                 age: text.replace(/[^0-9]/g, ""),
                              }))
                           }
                           placeholder="Ex: 28"
                           placeholderTextColor={colors.text.tertiary}
                           keyboardType="number-pad"
                           maxLength={3}
                        />
                     </View>

                     <View style={[styles.inputGroup, styles.flex1]}>
                        <Text style={styles.label}>Sexo</Text>
                        <View style={styles.pillGroup}>
                           {[
                              { id: "male", label: "Masc." },
                              { id: "female", label: "Fem." },
                              { id: "other", label: "Outro" },
                           ].map((option) => (
                              <TouchableOpacity
                                 key={option.id}
                                 style={[
                                    styles.pill,
                                    editData.gender === option.id &&
                                       styles.pillActive,
                                 ]}
                                 onPress={() =>
                                    setEditData((prev) => ({
                                       ...prev,
                                       gender: option.id,
                                    }))
                                 }
                              >
                                 <Text
                                    style={[
                                       styles.pillText,
                                       editData.gender === option.id &&
                                          styles.pillTextActive,
                                    ]}
                                 >
                                    {option.label}
                                 </Text>
                              </TouchableOpacity>
                           ))}
                        </View>
                     </View>
                  </View>

                  <View style={styles.editButtons}>
                     <Button
                        title="Cancelar"
                        onPress={handleCancel}
                        variant="outline"
                        style={styles.editButton}
                     />
                     <Button
                        title="Salvar"
                        onPress={handleSave}
                        loading={saving}
                        style={styles.editButton}
                     />
                  </View>
               </View>
            ) : (
               <View style={styles.section}>
                  <Button
                     title="Editar Perfil"
                     onPress={() => setEditing(true)}
                     icon={
                        <Ionicons
                           name="create-outline"
                           size={20}
                           color="#fff"
                        />
                     }
                     style={styles.editProfileButton}
                  />

                  <Button
                     title="Sair da Conta"
                     onPress={handleLogout}
                     variant="outline"
                     loading={isLoggingOut}
                     icon={
                        <Ionicons
                           name="log-out-outline"
                           size={20}
                           color={colors.error}
                        />
                     }
                  />
               </View>
            )}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   content: {
      padding: spacing.lg,
   },
   header: {
      alignItems: "center",
      marginBottom: spacing["2xl"],
   },
   avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: spacing.md,
      position: "relative",
   },
   avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
   },
   avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.background.card,
      justifyContent: "center",
      alignItems: "center",
   },
   uploadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
   },
   cameraIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary[400],
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background.primary,
   },
   name: {
      fontSize: typography.fontSize["2xl"],
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   email: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
   },
   phone: {
      fontSize: typography.fontSize.base,
      color: colors.text.secondary,
      marginTop: spacing.xs,
   },
   metaRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.sm,
   },
   metaText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
   },
   editSection: {
      marginBottom: spacing.xl,
   },
   inputGroup: {
      marginBottom: spacing.lg,
   },
   label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
   },
   input: {
      backgroundColor: colors.background.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.base,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.default,
   },
   editButtons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
   },
   rowGroup: {
      flexDirection: "row",
      gap: spacing.md,
   },
   flex1: {
      flex: 1,
   },
   pillGroup: {
      flexDirection: "row",
      gap: spacing.xs,
      marginTop: spacing.xs,
   },
   pill: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border.default,
      backgroundColor: colors.background.card,
   },
   pillActive: {
      borderColor: colors.primary[500],
      backgroundColor: colors.background.elevated,
   },
   pillText: {
      color: colors.text.secondary,
      fontSize: typography.fontSize.sm,
   },
   pillTextActive: {
      color: colors.primary[400],
      fontWeight: typography.fontWeight.semibold,
   },
   editButton: {
      flex: 1,
   },
   section: {
      marginBottom: spacing.xl,
   },
   editProfileButton: {
      marginBottom: spacing.md,
   },
   backupSection: {
      backgroundColor: colors.background.card,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
   },
   sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   sectionDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
   },
   backupButton: {
      marginBottom: spacing.md,
   },
   backupActions: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
   },
   actionButton: {
      flex: 1,
   },
   backupInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.default,
   },
   backupInfoText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      flex: 1,
   },
   infoCard: {
      flexDirection: "row",
      padding: spacing.md,
      backgroundColor: colors.background.card,
      borderRadius: 12,
      marginBottom: spacing.md,
   },
   infoContent: {
      flex: 1,
      marginLeft: spacing.md,
   },
   infoTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
   },
   infoText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
   },
});
