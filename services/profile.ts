/**
 * Profile Service - Local profile management
 * Stores profile data in AsyncStorage
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { storage, STORAGE_KEYS } from './storage';
import { logAction } from './actionLogs';
import { api } from './api';
import { devError } from '@/utils/logger';

const PROFILES_STORAGE_KEY = STORAGE_KEYS.USER_PROFILE;

export interface UserProfile {
  id: string; // User ID
  username: string;
  phone: string;
  avatar_uri: string; // Local file path
  gender?: 'male' | 'female' | 'other' | '';
  age?: number | null;
  onboarding_completed?: boolean;
  updated_at: string;
  auth_id?: string;
}

/**
 * Get all profiles from storage
 */
async function getProfiles(): Promise<UserProfile[]> {
  try {
    const profiles = await storage.getItem<UserProfile>(PROFILES_STORAGE_KEY);
    return profiles;
  } catch (error) {
    devError('Error getting profiles:', error);
    return [];
  }
}

/**
 * Save profiles to storage
 */
async function saveProfiles(profiles: UserProfile[]): Promise<void> {
  try {
    await storage.setItem<UserProfile>(PROFILES_STORAGE_KEY, profiles);
  } catch (error) {
    devError('Error saving profiles:', error);
    throw error;
  }
}

/**
 * Get profile for specific user
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profiles = await getProfiles();
    return profiles.find(p => p.id === userId) || null;
  } catch (error) {
    devError('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update or create user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'updated_at'>>,
  skipLog: boolean = false
): Promise<void> {
  try {
    const profiles = await getProfiles();
    const existingIndex = profiles.findIndex(p => p.id === userId);

    let updatedProfile: UserProfile;
    const action = 'update';

    if (existingIndex >= 0) {
      // Update existing profile
      updatedProfile = {
        ...profiles[existingIndex],
        ...updates,
        onboarding_completed:
          updates.onboarding_completed ??
          profiles[existingIndex].onboarding_completed ??
          false,
        updated_at: new Date().toISOString(),
      };
      profiles[existingIndex] = updatedProfile;
    } else {
      // Create new profile
      updatedProfile = {
        id: userId,
        username: updates.username || '',
        phone: updates.phone || '',
        avatar_uri: updates.avatar_uri || '',
        gender: updates.gender || '',
        age: updates.age ?? null,
        onboarding_completed: updates.onboarding_completed ?? false,
        updated_at: new Date().toISOString(),
      };
      profiles.push(updatedProfile);
    }

    await saveProfiles(profiles);

    if (!skipLog) {
      // Registra log de ação para sincronização
      await logAction({
        table: 'user_profile',
        action,
        recordId: userId,
        payload: updatedProfile,
        userId,
      });
    }
  } catch (error) {
    devError('Error updating profile:', error);
    throw error;
  }
}

/**
 * Sync user profile to backend directly
 */
export async function syncUserProfileToBackend(profile: UserProfile): Promise<void> {
  const dto = {
    id: profile.id,
    username: profile.username,
    phone: profile.phone,
    avatar_uri: profile.avatar_uri,
    gender: profile.gender,
    age: profile.age || 0,
    onboarding_completed: profile.onboarding_completed
  };
  await api.patch('/user-profile', dto);
}

/**
 * Save avatar image to local storage and return URI
 */
export async function saveAvatarImage(
  userId: string,
  imageUri: string,
  assetId?: string
): Promise<string> {
  try {
    // Create avatars directory if it doesn't exist
    const avatarDir = `${FileSystem.documentDirectory}avatars/`;
    const dirInfo = await FileSystem.getInfoAsync(avatarDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(avatarDir, { intermediates: true });
    }

    // Resolve source URI to a readable file path
    let sourceUri = imageUri;
    try {
      const info = await FileSystem.getInfoAsync(sourceUri);
      if (!info.exists && assetId) {
        // Try resolve via MediaLibrary for iOS PH:// or other non-file paths
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (!perm.granted) {
          throw new Error('Permissão negada para acessar a biblioteca de mídia');
        }
        const asset = await MediaLibrary.getAssetInfoAsync(assetId);
        sourceUri = (asset.localUri || asset.uri) as string;
      }
    } catch {
      // Fallback: keep original URI and try copy; if it fails, we'll throw below
    }

    // Generate unique filename (derive extension from resolved source)
    const timestamp = Date.now();
    const extFromUri = (sourceUri.split('.').pop() || '').split('?')[0];
    const extension = extFromUri && extFromUri.length <= 5 ? extFromUri : 'jpg';
    const filename = `avatar_${userId}_${timestamp}.${extension}`;
    const destinationUri = `${avatarDir}${filename}`;

    // Copy image to app's document directory
    await FileSystem.copyAsync({ from: sourceUri, to: destinationUri });

    return destinationUri;
  } catch (error) {
    devError('Error saving avatar:', error);
    throw new Error('Falha ao salvar foto de perfil');
  }
}

/**
 * Delete old avatar image
 */
export async function deleteAvatarImage(avatarUri: string): Promise<void> {
  try {
    if (!avatarUri) return;

    const fileInfo = await FileSystem.getInfoAsync(avatarUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(avatarUri, { idempotent: true });
    }
  } catch (error) {
    devError('Error deleting avatar:', error);
    // Don't throw, just log - old file cleanup is not critical
  }
}
