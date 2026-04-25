import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { useAstraVoice } from '../../hooks/useAstraVoice';
import {
  getAstraVoiceCopy,
  getAstraVoicePreviewText,
  getAstraVoiceRuntimeStatus,
  getAstraVoiceStateLabel,
} from '../../services/astra/astraVoiceCopy';
import { getAstraVoiceRuntimeConfig } from '../../services/astra/astraRuntimeConfig';
import type { AstraVoiceActionPayload } from '../../types/astraVoice';
import { AstraAnimatedLogo } from './AstraAnimatedLogo';

function VoicePresence({
  active,
  speaking,
  level,
}: {
  active: boolean;
  speaking: boolean;
  level: number;
}) {
  const { colors } = useAppTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.stopAnimation();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: active ? 1150 : 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: active ? 1150 : 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => {
      loop.stop();
      pulse.stopAnimation();
    };
  }, [active, pulse]);

  const dynamicScale = 1 + Math.max(0, Math.min(level, 1)) * (speaking ? 0.12 : 0.06);

  return (
    <View style={styles.presenceWrap}>
      <Animated.View
        style={[
          styles.outerHalo,
          {
            backgroundColor: withOpacity(colors.profit, 0.08),
            borderColor: withOpacity(colors.profit, 0.14),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94 * dynamicScale, 1.08 * dynamicScale],
                }),
              },
            ],
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 0.78],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.midHalo,
          {
            backgroundColor: withOpacity(colors.primary, 0.08),
            borderColor: withOpacity(colors.primary, 0.12),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98 * dynamicScale, 1.14 * dynamicScale],
                }),
              },
            ],
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.28, 0.62],
            }),
          },
        ]}
      />
      <View
        style={[
          styles.coreShell,
          {
            backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
            borderColor: withOpacity(speaking ? colors.profit : colors.primary, 0.26),
            shadowColor: speaking ? colors.profit : colors.primary,
          },
        ]}
      >
            <AstraAnimatedLogo size={92} emphasis={active ? 'entry' : 'subtle'} />
      </View>
    </View>
  );
}

function QuickChip({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: primary
            ? withOpacity(colors.profit, 0.1)
            : withOpacity(colors.surfaceElevated, 0.92),
          borderColor: primary
            ? withOpacity(colors.profit, 0.22)
            : withOpacity(colors.borderStrong, 0.42),
        },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: primary ? colors.profit : colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ConversationSnippet({
  label,
  text,
  accent,
}: {
  label: string;
  text: string;
  accent: string;
}) {
  const { colors } = useAppTheme();

  if (!text.trim()) {
    return null;
  }

  return (
    <View
      style={[
        styles.snippet,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
          borderColor: withOpacity(accent, 0.2),
        },
      ]}
    >
      <Text style={[styles.snippetLabel, { color: accent }]}>{label}</Text>
      <Text style={[styles.snippetText, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

function VoicePresetCard({
  label,
  description,
  selected,
  selectedLabel,
  selectLabel,
  previewLabel,
  onSelect,
  onPreview,
}: {
  label: string;
  description: string;
  selected: boolean;
  selectedLabel: string;
  selectLabel: string;
  previewLabel: string;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.voiceCard,
        {
          backgroundColor: withOpacity(colors.surfaceElevated, 0.92),
          borderColor: selected
            ? withOpacity(colors.profit, 0.32)
            : withOpacity(colors.borderStrong, 0.36),
        },
      ]}
    >
      <Pressable onPress={onSelect} style={styles.voiceCardHeader}>
        <View
          style={[
            styles.voiceBadge,
            {
              backgroundColor: selected
                ? withOpacity(colors.profit, 0.16)
                : withOpacity(colors.primary, 0.1),
              borderColor: selected
                ? withOpacity(colors.profit, 0.3)
                : withOpacity(colors.primary, 0.16),
            },
          ]}
        >
          <Ionicons
            name={selected ? 'checkmark' : 'sparkles-outline'}
            size={14}
            color={selected ? colors.profit : colors.text}
          />
        </View>
        <View style={styles.voiceCardCopy}>
          <Text style={[styles.voiceCardTitle, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.voiceCardBody, { color: colors.textMuted }]}>{description}</Text>
        </View>
      </Pressable>

      <View style={styles.voiceCardActions}>
        <Pressable
          onPress={onSelect}
          style={[
            styles.voiceCardAction,
            {
              backgroundColor: selected
                ? withOpacity(colors.profit, 0.14)
                : withOpacity(colors.surfaceElevated, 0.84),
              borderColor: selected
                ? withOpacity(colors.profit, 0.26)
                : withOpacity(colors.borderStrong, 0.4),
            },
          ]}
        >
          <Text
            style={[
              styles.voiceCardActionLabel,
              { color: selected ? colors.profit : colors.textSoft },
            ]}
          >
            {selected ? selectedLabel : selectLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={onPreview}
          style={[
            styles.voiceCardAction,
            {
              backgroundColor: withOpacity(colors.surfaceElevated, 0.84),
              borderColor: withOpacity(colors.primary, 0.24),
            },
          ]}
        >
          <Text style={[styles.voiceCardActionLabel, { color: colors.primary }]}>
            {previewLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getVoiceBody(options: {
  copy: ReturnType<typeof getAstraVoiceCopy>;
  state: string;
  errorMessage: string | null;
  transcript: string;
  responseText: string;
}) {
  const { copy, state, errorMessage, transcript, responseText } = options;

  if (errorMessage) {
    return errorMessage;
  }

  if (state === 'listening') {
    return transcript.trim() ? transcript : copy.waitingPrompt;
  }

  if (state === 'paused') {
    return copy.silencePaused;
  }

  if (
    state === 'processing' ||
    state === 'responding' ||
    state === 'connecting' ||
    state === 'reconnecting' ||
    state === 'transcribing' ||
    state === 'requesting_permission'
  ) {
    return transcript.trim() || copy.waitingPrompt;
  }

  if (state === 'speaking') {
    return responseText.trim() || copy.playing;
  }

  return responseText.trim() || copy.waitingPrompt;
}

export function AstraVoiceSheet() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const language = useOrbitStore((state) => state.settings.language);
  const copy = getAstraVoiceCopy(language);
  const runtimeVoice = getAstraVoiceRuntimeConfig();
  const {
    isVoiceOpen,
    state,
    errorMessage,
    transcript,
    responseText,
    suggestions,
    responseActions,
    inputLevel,
    permissionDenied,
    voicePresets,
    selectedVoicePreset,
    ttsState,
    startConversation,
    stopListening,
    cancelConversation,
    submitSuggestion,
    runVoiceAction,
    speakText,
    openSettings,
    closeVoice,
    setSelectedVoicePresetId,
  } = useAstraVoice();

  const statusLabel = getAstraVoiceStateLabel(language, state);
  const isListening = state === 'listening';
  const isPaused = state === 'paused';
  const isThinking =
    state === 'processing' ||
    state === 'responding' ||
    state === 'connecting' ||
    state === 'reconnecting' ||
    state === 'transcribing' ||
    state === 'requesting_permission';
  const isSpeaking = state === 'speaking';
  const stateBody = getVoiceBody({
    copy,
    state,
    errorMessage,
    transcript,
    responseText,
  });

  const actionChips = useMemo(
    () =>
      responseActions.slice(0, 2).map((action: AstraVoiceActionPayload) => ({
        id: `${action.type}-${action.target ?? action.value ?? 'voice'}`,
        label: action.target ?? action.value ?? action.type,
        onPress: () => runVoiceAction(action),
        primary: true,
      })),
    [responseActions, runVoiceAction],
  );

  const suggestionChips = useMemo(
    () =>
      suggestions.slice(0, 4).map((suggestion) => ({
        id: suggestion,
        label: suggestion,
        onPress: () => void submitSuggestion(suggestion),
        primary: false,
      })),
    [submitSuggestion, suggestions],
  );

  const voiceStatusText = useMemo(() => {
    return getAstraVoiceRuntimeStatus(language, {
      provider: runtimeVoice.provider,
      hasPremiumError: ttsState.status === 'error' && Boolean(ttsState.error),
    });
  }, [language, runtimeVoice.provider, ttsState.error, ttsState.status]);

  if (!isVoiceOpen) {
    return null;
  }

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={closeVoice}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={[withOpacity(colors.background, 0.98), withOpacity(colors.backgroundAlt, 0.98)]}
          style={[styles.fullscreen, { paddingTop: Math.max(insets.top, 22), paddingBottom: Math.max(insets.bottom, 18) }]}
        >
          <View style={styles.topBar}>
            <View style={styles.topGhost} />
            <View style={styles.topCopy}>
              <Text style={[styles.title, { color: colors.text }]}>{copy.title}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{copy.subtitle}</Text>
            </View>
            <Pressable
              onPress={() => void cancelConversation().then(closeVoice)}
              style={[
                styles.closeButton,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                  borderColor: withOpacity(colors.borderStrong, 0.42),
                },
              ]}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.centerStage}>
            <VoicePresence
              active={isListening || isThinking || isSpeaking}
              speaking={isSpeaking}
              level={inputLevel}
            />

            <Text
              style={[
                styles.stateTitle,
                {
                  color: isListening
                    ? colors.profit
                    : isPaused
                      ? colors.textMuted
                    : isThinking
                      ? colors.primary
                      : isSpeaking
                        ? colors.profit
                        : colors.text,
                },
              ]}
            >
              {statusLabel}
            </Text>

            <Text style={[styles.stateBody, { color: errorMessage ? colors.loss : colors.textMuted }]}>
              {stateBody}
            </Text>
          </View>

          <ScrollView
            style={styles.bottomArea}
            contentContainerStyle={styles.bottomContent}
            showsVerticalScrollIndicator={false}
          >
            <ConversationSnippet
              label={copy.youLabel}
              text={transcript}
              accent={colors.textMuted}
            />
            <ConversationSnippet
              label="Astra"
              text={responseText}
              accent={colors.profit}
            />

            {permissionDenied ? (
              <Pressable
                onPress={() => void openSettings()}
                style={[
                  styles.permissionButton,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                    borderColor: withOpacity(colors.loss, 0.24),
                  },
                ]}
              >
                <Text style={[styles.permissionLabel, { color: colors.text }]}>
                  {copy.permissionAction}
                </Text>
              </Pressable>
            ) : null}

            <View
              style={[
                styles.voicePanel,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                  borderColor: withOpacity(colors.borderStrong, 0.38),
                },
              ]}
            >
              <View style={styles.voicePanelHeader}>
                <Text style={[styles.voicePanelTitle, { color: colors.text }]}>
                  {copy.voicePanelTitle}
                </Text>
                <Text
                  style={[
                    styles.voicePanelStatus,
                    {
                      color:
                        runtimeVoice.provider === 'elevenlabs' && !(ttsState.status === 'error' && ttsState.error)
                          ? colors.profit
                          : colors.textMuted,
                    },
                  ]}
                >
                  {voiceStatusText}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.voicePresetRow}
              >
                {voicePresets.map((preset) => (
                  <VoicePresetCard
                    key={preset.id}
                    label={preset.label}
                    description={preset.description}
                    selected={selectedVoicePreset.id === preset.id}
                    selectedLabel={copy.voiceSelected}
                    selectLabel={copy.voiceSelect}
                    previewLabel={copy.voicePreview}
                    onSelect={() => setSelectedVoicePresetId(preset.id)}
                    onPreview={() => void speakText(getAstraVoicePreviewText(language, preset.label), 'welcome')}
                  />
                ))}
              </ScrollView>
            </View>

            {actionChips.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {actionChips.map((chip) => (
                  <QuickChip
                    key={chip.id}
                    label={chip.label}
                    onPress={chip.onPress}
                    primary={chip.primary}
                  />
                ))}
              </ScrollView>
            ) : null}

            {suggestionChips.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {suggestionChips.map((chip) => (
                  <QuickChip
                    key={chip.id}
                    label={chip.label}
                    onPress={chip.onPress}
                    primary={chip.primary}
                  />
                ))}
              </ScrollView>
            ) : null}
          </ScrollView>

          <View style={styles.controls}>
            <Pressable
              onPress={() => {
                if (isListening || isThinking) {
                  void stopListening();
                  return;
                }

                void startConversation();
              }}
              style={[
                styles.primaryOrb,
                {
                  backgroundColor: withOpacity(colors.profit, 0.12),
                  borderColor: withOpacity(colors.profit, 0.28),
                  shadowColor: colors.profit,
                },
              ]}
            >
              <LinearGradient
                colors={[withOpacity(colors.profit, 0.92), withOpacity(colors.primary, 0.68)]}
                style={styles.primaryOrbInner}
              >
                <Ionicons
                  name={isListening || isThinking ? 'pause' : 'mic'}
                  size={24}
                  color={colors.background}
                />
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => void cancelConversation().then(closeVoice)}
              style={[
                styles.closePill,
                {
                  backgroundColor: withOpacity(colors.surfaceElevated, 0.9),
                  borderColor: withOpacity(colors.borderStrong, 0.42),
                },
              ]}
            >
              <Text style={[styles.closePillLabel, { color: colors.text }]}>
                {copy.close}
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(1,3,8,0.82)',
  },
  fullscreen: {
    flex: 1,
    paddingHorizontal: 22,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topGhost: {
    width: 42,
  },
  topCopy: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 26,
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  presenceWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
  },
  midHalo: {
    position: 'absolute',
    width: 194,
    height: 194,
    borderRadius: 97,
    borderWidth: 1,
  },
  coreShell: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  stateTitle: {
    fontFamily: FONT.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  stateBody: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 18,
    maxWidth: 340,
  },
  bottomArea: {
    maxHeight: '34%',
  },
  bottomContent: {
    gap: 12,
    paddingBottom: 10,
  },
  snippet: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 6,
  },
  snippetLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  snippetText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  permissionButton: {
    minHeight: 46,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  permissionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    minHeight: 36,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  controls: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 10,
  },
  voicePanel: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  voicePanelHeader: {
    gap: 4,
  },
  voicePanelTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  voicePanelStatus: {
    fontFamily: FONT.medium,
    fontSize: 11,
  },
  voicePresetRow: {
    gap: 10,
    paddingRight: 8,
  },
  voiceCard: {
    width: 180,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 12,
  },
  voiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  voiceCardCopy: {
    flex: 1,
    gap: 4,
  },
  voiceCardTitle: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  voiceCardBody: {
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  voiceBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  voiceCardAction: {
    flex: 1,
    minHeight: 34,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  voiceCardActionLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  primaryOrb: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  primaryOrbInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePill: {
    minHeight: 42,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePillLabel: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
});
