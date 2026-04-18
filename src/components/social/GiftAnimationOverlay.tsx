import { Ionicons } from '@expo/vector-icons';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Image as ExpoImage } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { SocialGiftBurst } from '../../types/social';
import { devWarn } from '../../utils/devLog';

interface GiftAnimationOverlayProps {
  burst?: SocialGiftBurst | null;
  visible: boolean;
  onComplete?: () => void;
}

interface GiftPlaybackStatusLike {
  isLoaded?: boolean;
  didJustFinish?: boolean;
}

interface GiftSoundLike {
  stopAsync?: () => Promise<unknown>;
  unloadAsync?: () => Promise<unknown>;
  setOnPlaybackStatusUpdate?: (
    callback: (status: GiftPlaybackStatusLike) => void,
  ) => void;
}

interface ExpoAvLikeModule {
  Audio: {
    setAudioModeAsync: (mode: Record<string, unknown>) => Promise<unknown>;
    Sound: {
      createAsync: (
        asset: number,
        initialStatus: Record<string, unknown>,
      ) => Promise<{ sound: GiftSoundLike }>;
    };
  };
}

const BURST_DURATION = 4400;
const STORE_CLIENT = ExecutionEnvironment.StoreClient;

let cachedExpoAvModulePromise: Promise<ExpoAvLikeModule | null> | null = null;

async function loadExpoAvModuleSafely() {
  if (Platform.OS === 'web') {
    return null;
  }

  if (!cachedExpoAvModulePromise) {
    cachedExpoAvModulePromise = import('expo-av')
      .then((module) => {
        const candidate = module as unknown as ExpoAvLikeModule;
        if (!candidate?.Audio?.Sound?.createAsync) {
          return null;
        }

        return candidate;
      })
      .catch((error) => {
        devWarn('[OrbitX][GiftAnimationOverlay] expo-av unavailable', error);
        return null;
      });
  }

  return cachedExpoAvModulePromise;
}

async function unloadSoundSafely(soundRef: React.MutableRefObject<GiftSoundLike | null>) {
  const current = soundRef.current;
  if (!current) {
    return;
  }

  soundRef.current = null;

  try {
    await current.stopAsync?.();
  } catch {}

  try {
    await current.unloadAsync?.();
  } catch {}
}

async function playGiftSoundSafely(params: {
  asset: number;
  soundRef: React.MutableRefObject<GiftSoundLike | null>;
  shouldPlaySound: boolean;
  playbackAttemptRef: React.MutableRefObject<number>;
  currentAttempt: number;
}) {
  const {
    asset,
    soundRef,
    shouldPlaySound,
    playbackAttemptRef,
    currentAttempt,
  } = params;

  if (!shouldPlaySound) {
    return false;
  }

  const expoAv = await loadExpoAvModuleSafely();
  if (!expoAv) {
    return false;
  }

  try {
    await expoAv.Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1,
      interruptionModeIOS: 1,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await expoAv.Audio.Sound.createAsync(asset, {
      shouldPlay: true,
      volume: 1,
      progressUpdateIntervalMillis: 200,
    });

    if (playbackAttemptRef.current !== currentAttempt) {
      try {
        await sound.unloadAsync?.();
      } catch {}
      return false;
    }

    soundRef.current = sound;
    sound.setOnPlaybackStatusUpdate?.((status) => {
      if (!status?.isLoaded || !status.didJustFinish) {
        return;
      }

      void unloadSoundSafely(soundRef);
    });

    return true;
  } catch (error) {
    devWarn('[OrbitX][GiftAnimationOverlay] sound playback failed', error);
    await unloadSoundSafely(soundRef);
    return false;
  }
}

export function GiftAnimationOverlay({
  burst,
  visible,
  onComplete,
}: GiftAnimationOverlayProps) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(0);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundRef = useRef<GiftSoundLike | null>(null);
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const completionLockedRef = useRef(false);
  const playbackAttemptRef = useRef(0);

  const isInfernoLion = burst?.giftId === 'gift-inferno-lion';
  const accentColor = isInfernoLion ? '#FF9B2F' : colors.primary;
  const accentGlow = isInfernoLion ? '#FF5A1F' : '#19D9FF';
  const iconName = useMemo(() => {
    if (isInfernoLion) {
      return 'flame';
    }

    if (burst?.giftId === 'gift-nebula') {
      return 'sparkles';
    }

    return 'gift';
  }, [burst?.giftId, isInfernoLion]);

  const shouldPlaySound =
    Platform.OS !== 'android' || Constants.executionEnvironment !== STORE_CLIENT;
  const shouldUseAnimatedImage = burst?.overlayAssetType === 'animated_image' && Boolean(burst?.overlayAsset);
  const shouldUseVideo = !shouldUseAnimatedImage && Boolean(burst?.overlayAsset);

  const player = useVideoPlayer(visible && shouldUseVideo ? burst?.overlayAsset ?? null : null, (instance) => {
    instance.loop = false;
    instance.muted = shouldPlaySound;
    instance.volume = 1;
    instance.staysActiveInBackground = false;
    instance.keepScreenOnWhilePlaying = false;
    instance.showNowPlayingNotification = false;
  });

  const finishOverlay = useCallback(() => {
    if (completionLockedRef.current || !isMountedRef.current) {
      return;
    }

    completionLockedRef.current = true;
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      completionLockedRef.current = true;
      playbackAttemptRef.current += 1;

      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
        completionTimer.current = null;
      }

      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
        playbackTimer.current = null;
      }

      if (shouldUseVideo) {
        player.pause();
      }

      void unloadSoundSafely(soundRef);
    };
  }, [player, shouldUseVideo]);

  useEffect(() => {
    playbackAttemptRef.current += 1;
    completionLockedRef.current = false;

    if (!visible || !burst) {
      progress.value = 0;

      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
        completionTimer.current = null;
      }

      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
        playbackTimer.current = null;
      }

      if (shouldUseVideo) {
        player.pause();
      }

      void unloadSoundSafely(soundRef);
      return;
    }

    const currentAttempt = playbackAttemptRef.current;
    progress.value = 0;
    if (shouldUseVideo) {
      player.pause();
      player.currentTime = 0;
      playbackTimer.current = setTimeout(() => {
        player.play();
      }, 80);
    }

    progress.value = withTiming(
      1,
      {
        duration: BURST_DURATION,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishOverlay)();
        }
      },
    );

    if (completionTimer.current) {
      clearTimeout(completionTimer.current);
    }

    completionTimer.current = setTimeout(() => {
      finishOverlay();
    }, BURST_DURATION + 240);

    if (burst.soundAsset) {
      void playGiftSoundSafely({
        asset: burst.soundAsset,
        soundRef,
        shouldPlaySound,
        playbackAttemptRef,
        currentAttempt,
      });
    }

    return () => {
      playbackAttemptRef.current += 1;

      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
        completionTimer.current = null;
      }

      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
        playbackTimer.current = null;
      }

      if (shouldUseVideo) {
        player.pause();
      }

      void unloadSoundSafely(soundRef);
    };
  }, [burst, finishOverlay, player, progress, shouldPlaySound, shouldUseVideo, visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.1, 0.88, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const mediaStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.16, 0.46, 1],
          [0.76, 1, 1.14, 1.04],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [24, -18],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.2, 0.72, 1],
      [0, 0.42, 0.28, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 0.42, 1],
          [0.74, 1.18, 1.4],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.08, 0.16, 0.9, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [10, -12],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  if (!visible || !burst) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={finishOverlay}
    >
      <Animated.View pointerEvents="none" style={[styles.wrap, containerStyle]}>
      <Animated.View
        style={[
          styles.bloom,
          {
            backgroundColor: withOpacity(accentGlow, 0.16),
          },
          bloomStyle,
        ]}
      />

      <Animated.View
        style={[
          styles.assetShell,
          mediaStyle,
        ]}
      >
            {shouldUseAnimatedImage && burst?.overlayAsset ? (
              <ExpoImage
                source={burst.overlayAsset}
                style={styles.video}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={0}
              />
            ) : shouldUseVideo ? (
              <VideoView
                player={player}
                style={styles.video}
            nativeControls={false}
            contentFit="contain"
            surfaceType="textureView"
          />
        ) : (
          <>
            <View
              style={[
                styles.iconHalo,
                {
                  backgroundColor: withOpacity(accentColor, 0.16),
                  borderColor: withOpacity(accentColor, 0.24),
                },
              ]}
            />
            <Ionicons name={iconName} size={112} color={accentColor} />
          </>
        )}
      </Animated.View>

        <Animated.View style={[styles.copyWrap, copyStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>{burst.label}</Text>
          <Text style={[styles.sender, { color: colors.textSoft }]}>
            {burst.senderName} envio un regalo
          </Text>
          <View
            style={[
              styles.pricePill,
              {
                backgroundColor: withOpacity(colors.profit, 0.16),
                borderColor: withOpacity(colors.profit, 0.28),
              },
            ]}
          >
            <Text style={[styles.priceText, { color: colors.profit }]}>
              $ {burst.priceUsd}
            </Text>
          </View>
          {!shouldPlaySound ? (
            <Text style={[styles.note, { color: colors.textMuted }]}>
              Audio premium disponible en builds compatibles.
            </Text>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloom: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
  },
  assetShell: {
    width: '96%',
    height: '72%',
    maxWidth: 430,
    maxHeight: 680,
    overflow: 'visible',
    shadowColor: '#7B3FE4',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  iconHalo: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1,
  },
  copyWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 38,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  sender: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  pricePill: {
    marginTop: 6,
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: 15,
  },
  note: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: 11,
  },
});
