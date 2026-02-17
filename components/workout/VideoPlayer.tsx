/**
 * VideoPlayer Component
 * YouTube video player for exercise demonstration
 * Uses Image with YouTube thumbnail and opens in browser
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { devError } from '@/utils/logger';

interface VideoPlayerProps {
  videoUrl: string;
  exerciseName?: string;
  showPlayButton?: boolean;
  autoOpenOnPress?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  exerciseName,
  showPlayButton = true,
  autoOpenOnPress = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const videoId = getVideoId(videoUrl);
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;

  const handlePress = async () => {
    if (autoOpenOnPress && videoUrl) {
      try {
        const canOpen = await Linking.canOpenURL(videoUrl);
        if (canOpen) {
          await Linking.openURL(videoUrl);
        }
      } catch (err) {
        devError('Error opening video URL:', err);
      }
    }
  };

  if (!thumbnailUrl) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="videocam-off" size={48} color={colors.text.tertiary} />
        <Text style={styles.placeholderText}>Vídeo não disponível</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: thumbnailUrl }}
        style={styles.thumbnail}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        resizeMode="cover"
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      )}
      
      {error && (
        <View style={styles.errorOverlay}>
          <Ionicons name="image-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.errorText}>Imagem não disponível</Text>
        </View>
      )}
      
      {showPlayButton && !loading && !error && (
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color={colors.text.primary} />
          </View>
          {exerciseName && (
            <Text style={styles.exerciseLabel}>{exerciseName}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * VideoPlaceholder Component
 * Simple placeholder for exercise video
 */
interface VideoPlaceholderProps {
  exerciseName: string;
  duration?: number;
  onPress?: () => void;
}

export const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({
  exerciseName,
  duration,
  onPress,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableOpacity 
      style={styles.placeholder}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.placeholderContent}>
        <View style={styles.playButtonLarge}>
          <Ionicons name="play" size={48} color={colors.text.primary} />
        </View>
        <Text style={styles.placeholderTitle}>{exerciseName}</Text>
        {duration && (
          <Text style={styles.placeholderDuration}>
            {formatDuration(duration)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * ExerciseVideoDisplay Component
 * Displays exercise with image and countdown overlay
 */
interface ExerciseVideoDisplayProps {
  imageUrl: string;
  exerciseName: string;
  remainingTime: number;
  isResting?: boolean;
}

export const ExerciseVideoDisplay: React.FC<ExerciseVideoDisplayProps> = ({
  imageUrl,
  exerciseName,
  remainingTime,
  isResting = false,
}) => {
  const [loading, setLoading] = useState(true);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.exerciseDisplay}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.exerciseImage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        resizeMode="cover"
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary[400]} />
        </View>
      )}
      
      <View style={styles.exerciseOverlay}>
        <View style={styles.timerContainer}>
          <Text style={[styles.timerText, isResting && styles.timerTextResting]}>
            {formatTime(remainingTime)}
          </Text>
          <Text style={styles.timerLabel}>
            {isResting ? 'Descanso' : exerciseName}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  playButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseLabel: {
    color: colors.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Placeholder styles
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderTitle: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    marginTop: spacing.sm,
  },
  placeholderDuration: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Exercise display styles
  exerciseDisplay: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exerciseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    color: colors.text.primary,
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
  },
  timerTextResting: {
    color: colors.primary[400],
  },
  timerLabel: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.lg,
    marginTop: spacing.xs,
  },
});
