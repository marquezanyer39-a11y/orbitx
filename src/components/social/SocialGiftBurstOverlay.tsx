import Constants, { ExecutionEnvironment } from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import type { SocialGiftBurst } from '../../types/social';

interface SocialGiftBurstOverlayProps {
  burst?: SocialGiftBurst;
  onComplete?: () => void;
  fullscreen?: boolean;
}

export function SocialGiftBurstOverlay({
  burst,
  onComplete,
  fullscreen = false,
}: SocialGiftBurstOverlayProps) {
  if (!burst || !burst.previewAsset) {
    return null;
  }

  return (
    <GiftBurstOverlayContent
      key={burst.id}
      burst={burst}
      onComplete={onComplete}
      fullscreen={fullscreen}
    />
  );
}

function GiftBurstOverlayContent({
  burst,
  onComplete,
  fullscreen,
}: Required<Pick<SocialGiftBurstOverlayProps, 'burst'>> &
  Pick<SocialGiftBurstOverlayProps, 'onComplete' | 'fullscreen'>) {
  const { colors } = useAppTheme();
  const progress = useRef(new Animated.Value(0)).current;
  const isInfernoLion = burst.giftId === 'gift-inferno-lion';
  const accentColor = isInfernoLion ? '#FF9B2F' : colors.primary;
  const accentGlow = isInfernoLion ? '#FF5A1F' : colors.primary;
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldUseSafeBurstMode =
    Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const shouldUseVideo = !shouldUseSafeBurstMode;
  const giftIcon = isInfernoLion ? 'flame' : burst.giftId === 'gift-nebula' ? 'sparkles' : 'gift';

  const player = useVideoPlayer(shouldUseVideo ? burst.previewAsset : null, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.volume = 1;
    instance.staysActiveInBackground = false;
    instance.keepScreenOnWhilePlaying = false;
    instance.showNowPlayingNotification = false;
  });

  useEffect(() => {
    progress.setValue(0);
    if (shouldUseVideo) {
      player.pause();
      player.currentTime = 0;
    }

    if (shouldUseVideo) {
      playbackTimer.current = setTimeout(() => {
        player.play();
      }, 120);
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 2800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        onComplete?.();
      }
    });

    return () => {
      animation.stop();
      if (playbackTimer.current) {
        clearTimeout(playbackTimer.current);
        playbackTimer.current = null;
      }
      if (shouldUseVideo) {
        player.pause();
      }
    };
  }, [onComplete, player, progress, shouldUseVideo]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, -64],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.82, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.12, 0.34, 0.8, 1],
    outputRange: [0.62, 0.94, 1.12, 1.08, 1.02],
  });

  const bloomScale = progress.interpolate({
    inputRange: [0, 0.28, 1],
    outputRange: [0.52, 1.18, 1.42],
  });

  const bloomOpacity = progress.interpolate({
    inputRange: [0, 0.16, 0.68, 1],
    outputRange: [0, 0.34, 0.22, 0],
  });

  const haloOpacity = progress.interpolate({
    inputRange: [0, 0.16, 0.84, 1],
    outputRange: [0, 0.82, 0.56, 0],
  });

  const sparkleLift = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -34],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        fullscreen ? styles.fullscreenWrap : styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {fullscreen ? (
        <>
          <Animated.View
            style={[
              styles.fullscreenVeil,
              {
                opacity: bloomOpacity,
                backgroundColor: withOpacity('#050505', 0.42),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.fullscreenBloom,
              {
                opacity: bloomOpacity,
                backgroundColor: withOpacity(isInfernoLion ? accentGlow : colors.loss, 0.22),
                transform: [{ scale: bloomScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.fullscreenHalo,
              {
                opacity: haloOpacity,
                borderColor: withOpacity(accentColor, 0.42),
                transform: [{ scale: bloomScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.sparkleOne,
              {
                opacity: haloOpacity,
                backgroundColor: withOpacity(accentColor, 0.42),
                transform: [{ translateY: sparkleLift }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.sparkleTwo,
              {
                opacity: haloOpacity,
                backgroundColor: withOpacity(colors.text, 0.38),
                transform: [{ translateY: sparkleLift }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.sparkleThree,
              {
                opacity: haloOpacity,
                backgroundColor: withOpacity(accentGlow, 0.26),
                transform: [{ translateY: sparkleLift }],
              },
            ]}
          />
        </>
      ) : null}

      <LinearGradient
        colors={[
          withOpacity(accentColor, fullscreen ? 0.22 : 0.28),
          withOpacity(accentGlow, fullscreen ? 0.08 : 0.1),
          withOpacity('#050505', fullscreen ? 0.18 : 0.28),
        ]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          fullscreen ? styles.fullscreenShell : styles.shell,
          {
            borderColor: withOpacity(accentColor, fullscreen ? 0.24 : 0.28),
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.glow, { backgroundColor: withOpacity(accentColor, fullscreen ? 0.22 : 0.18) }]} />
        {shouldUseVideo ? (
          <VideoView
            player={player}
            style={fullscreen ? styles.fullscreenVideo : styles.video}
            nativeControls={false}
            contentFit={fullscreen ? 'cover' : 'contain'}
            surfaceType="textureView"
          />
        ) : (
          <View style={fullscreen ? styles.safeBurstVisualFullscreen : styles.safeBurstVisual}>
            <Animated.View
              style={[
                styles.safeBurstOrb,
                {
                  backgroundColor: withOpacity(accentColor, 0.18),
                  borderColor: withOpacity(accentColor, 0.36),
                  transform: [{ scale: bloomScale }],
                  opacity: haloOpacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.safeBurstCore,
                {
                  backgroundColor: withOpacity('#0B0B0F', 0.44),
                  borderColor: withOpacity(accentColor, 0.26),
                  transform: [{ scale }],
                },
              ]}
            >
              <Ionicons name={giftIcon} size={fullscreen ? 92 : 52} color={accentColor} />
            </Animated.View>
          </View>
        )}

        <View style={fullscreen ? styles.fullscreenCopyRow : styles.copyRow}>
          <View style={styles.copyBlock}>
            <Text style={[fullscreen ? styles.fullscreenLabel : styles.label, { color: colors.text }]}>
              {burst.label}
            </Text>
            <Text style={[styles.sender, { color: colors.textSoft }]}>
              {burst.senderName} envio un regalo
            </Text>
            {shouldUseSafeBurstMode ? (
              <Text style={[styles.safetyNote, { color: colors.textMuted }]}>
                Efecto estable optimizado para Expo Go.
              </Text>
            ) : null}
          </View>

          <View
            style={[
              styles.pricePill,
              {
                backgroundColor: withOpacity(colors.profit, 0.16),
                borderColor: withOpacity(isInfernoLion ? accentColor : colors.profit, 0.28),
              },
            ]}
          >
            <Text
              style={[
                fullscreen ? styles.fullscreenPriceText : styles.priceText,
                { color: isInfernoLion ? accentColor : colors.profit },
              ]}
            >
              $ {burst.priceUsd}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 152,
    height: 244,
    justifyContent: 'flex-end',
  },
  fullscreenWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVeil: {
    ...StyleSheet.absoluteFillObject,
  },
  fullscreenBloom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  fullscreenHalo: {
    position: 'absolute',
    width: 356,
    height: 356,
    borderRadius: 178,
    borderWidth: 1,
  },
  sparkleOne: {
    position: 'absolute',
    top: '24%',
    left: '26%',
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  sparkleTwo: {
    position: 'absolute',
    top: '32%',
    right: '24%',
    width: 7,
    height: 7,
    borderRadius: 7,
  },
  sparkleThree: {
    position: 'absolute',
    top: '42%',
    left: '18%',
    width: 14,
    height: 14,
    borderRadius: 14,
  },
  shell: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#7B3FE4',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  fullscreenShell: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  fullscreenVideo: {
    width: '94%',
    height: '76%',
    marginTop: 28,
  },
  safeBurstVisual: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeBurstVisualFullscreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeBurstOrb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
  },
  safeBurstCore: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B3FE4',
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  fullscreenCopyRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 84,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  copyBlock: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  fullscreenLabel: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  sender: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  safetyNote: {
    fontFamily: FONT.regular,
    fontSize: 11,
  },
  pricePill: {
    minWidth: 66,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  fullscreenPriceText: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
});
