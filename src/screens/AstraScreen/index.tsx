import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOrbitStore } from '../../../store/useOrbitStore';
import { AstraFlowStepper } from '../../components/astra/AstraFlowStepper';
import { AstraHeader } from '../../components/astra/AstraHeader';
import { AstraInputBar } from '../../components/astra/AstraInputBar';
import {
  AstraMessageBubble,
  type AstraChatMessageItem,
} from '../../components/astra/AstraMessageBubble';
import type { AstraQuickChipItem } from '../../components/astra/AstraQuickChips';
import { executeAstraAction } from '../../services/astra/astraActions';
import {
  buildAstraBootstrapResponse,
  createAstraMessage,
  getLocalizedAstraSurfaceLabel,
} from '../../services/astra/astraCore';
import { useAstraStore } from '../../store/astraStore';
import type {
  AstraAction,
  AstraGuideId,
  AstraGuideProgress,
  AstraMessage,
  AstraResponse,
  AstraSupportContext,
} from '../../types/astra';

type ChatLanguage = 'es' | 'en';

interface ScreenCopy {
  headerTitle: string;
  headerSubtitle: string;
  active: string;
  placeholder: string;
  typing: string;
  menuReset: string;
  menuMute: string;
  menuUnmute: string;
  menuClose: string;
  menuOpenCurrent: string;
  footerBrand: string;
}

interface FlowStep {
  id: string;
  label: string;
}

interface FlowConfig {
  title: string;
  subtitle: string;
  steps: FlowStep[];
}

const COPY: Record<ChatLanguage, ScreenCopy> = {
  es: {
    headerTitle: 'Astra',
    headerSubtitle: 'Asistente OrbitX',
    active: 'Activa',
    placeholder: 'Pregúntale algo a Astra',
    typing: 'Astra está preparando la mejor siguiente acción...',
    menuReset: 'Reiniciar conversación',
    menuMute: 'Silenciar voz',
    menuUnmute: 'Activar voz',
    menuClose: 'Cerrar Astra',
    menuOpenCurrent: 'Abrir módulo actual',
    footerBrand: 'OrbitX',
  },
  en: {
    headerTitle: 'Astra',
    headerSubtitle: 'OrbitX Assistant',
    active: 'Active',
    placeholder: 'Ask Astra anything',
    typing: 'Astra is preparing the best next action...',
    menuReset: 'Reset conversation',
    menuMute: 'Mute voice',
    menuUnmute: 'Enable voice',
    menuClose: 'Close Astra',
    menuOpenCurrent: 'Open current module',
    footerBrand: 'OrbitX',
  },
};

function createFallbackContext(language: ChatLanguage): AstraSupportContext {
  return {
    surface: 'general',
    path: '/astra',
    language,
    screenName: getLocalizedAstraSurfaceLabel(language, 'general'),
    summary:
      language === 'es'
        ? 'Astra lista para ayudarte dentro de OrbitX.'
        : 'Astra is ready to help you inside OrbitX.',
  };
}

function getGuideFlow(language: ChatLanguage, guideId?: AstraGuideId | null): FlowConfig | null {
  const es = language === 'es';

  switch (guideId) {
    case 'create_wallet':
      return {
        title: es ? 'Crear wallet' : 'Create wallet',
        subtitle: es ? 'Activa tu espacio Web3' : 'Activate your Web3 space',
        steps: [
          { id: 'wallet', label: es ? 'Wallet' : 'Wallet' },
          { id: 'verify', label: es ? 'Verificar' : 'Verify' },
          { id: 'protect', label: es ? 'Proteger' : 'Protect' },
          { id: 'activate', label: es ? 'Activar' : 'Activate' },
        ],
      };
    case 'spot_trade':
      return {
        title: es ? 'Operar Spot' : 'Spot trade',
        subtitle: es ? 'Revisa par, contexto y entrada' : 'Review pair, context and entry',
        steps: [
          { id: 'market', label: es ? 'Mercado' : 'Market' },
          { id: 'pair', label: es ? 'Par' : 'Pair' },
          { id: 'entry', label: es ? 'Entrada' : 'Entry' },
          { id: 'confirm', label: es ? 'Confirmar' : 'Confirm' },
        ],
      };
    case 'activate_security':
      return {
        title: es ? 'Seguridad' : 'Security',
        subtitle: es ? 'Protege tu cuenta OrbitX' : 'Protect your OrbitX account',
        steps: [
          { id: '2fa', label: '2FA' },
          { id: 'sessions', label: es ? 'Sesiones' : 'Sessions' },
          { id: 'lock', label: es ? 'Bloqueo' : 'Lock' },
          { id: 'review', label: es ? 'Revisar' : 'Review' },
        ],
      };
    case 'buy_crypto':
      return {
        title: es ? 'Comprar crypto' : 'Buy crypto',
        subtitle: es ? 'Elige proveedor y monto' : 'Choose provider and amount',
        steps: [
          { id: 'provider', label: es ? 'Proveedor' : 'Provider' },
          { id: 'amount', label: es ? 'Monto' : 'Amount' },
          { id: 'payment', label: es ? 'Pago' : 'Payment' },
          { id: 'confirm', label: es ? 'Confirmar' : 'Confirm' },
        ],
      };
    default:
      return null;
  }
}

function getSurfaceFlow(language: ChatLanguage, context: AstraSupportContext): FlowConfig {
  const es = language === 'es';

  switch (context.surface) {
    case 'wallet':
      return {
        title: context.walletReady
          ? es
            ? 'Wallet activa'
            : 'Wallet ready'
          : es
            ? 'Crear wallet'
            : 'Create wallet',
        subtitle: context.walletReady
          ? es
            ? 'Gestiona saldo y seguridad'
            : 'Manage balance and security'
          : es
            ? 'Activa tu espacio Web3'
            : 'Activate your Web3 space',
        steps: [
          { id: 'wallet', label: es ? 'Wallet' : 'Wallet' },
          { id: 'fund', label: es ? 'Fondos' : 'Funds' },
          { id: 'protect', label: es ? 'Seguridad' : 'Security' },
          { id: 'use', label: es ? 'Usar' : 'Use' },
        ],
      };
    case 'trade':
      return {
        title: es ? 'Trade' : 'Trade',
        subtitle: es ? 'Opera con contexto y control' : 'Operate with context and control',
        steps: [
          { id: 'market', label: es ? 'Mercado' : 'Market' },
          { id: 'pair', label: es ? 'Par' : 'Pair' },
          { id: 'risk', label: es ? 'Riesgo' : 'Risk' },
          { id: 'execute', label: es ? 'Ejecutar' : 'Execute' },
        ],
      };
    case 'market':
      return {
        title: es ? 'Mercados' : 'Markets',
        subtitle: es ? 'Encuentra tu siguiente par' : 'Find your next pair',
        steps: [
          { id: 'scan', label: es ? 'Escanear' : 'Scan' },
          { id: 'pair', label: es ? 'Par' : 'Pair' },
          { id: 'context', label: es ? 'Contexto' : 'Context' },
          { id: 'trade', label: es ? 'Trade' : 'Trade' },
        ],
      };
    case 'social':
      return {
        title: 'Social',
        subtitle: es ? 'Explora contenido y perfiles' : 'Explore content and profiles',
        steps: [
          { id: 'feed', label: es ? 'Feed' : 'Feed' },
          { id: 'profile', label: es ? 'Perfil' : 'Profile' },
          { id: 'market', label: es ? 'Mercado' : 'Market' },
          { id: 'action', label: es ? 'Acción' : 'Action' },
        ],
      };
    case 'create_token':
      return {
        title: es ? 'Crear token' : 'Create token',
        subtitle: es ? 'Nombre, imagen y lanzamiento' : 'Name, image and launch',
        steps: [
          { id: 'wallet', label: es ? 'Wallet' : 'Wallet' },
          { id: 'config', label: es ? 'Config' : 'Config' },
          { id: 'image', label: es ? 'Imagen' : 'Image' },
          { id: 'launch', label: es ? 'Launch' : 'Launch' },
        ],
      };
    case 'bot_futures':
      return {
        title: 'Bot Futures',
        subtitle: es ? 'Opera con flujo y control' : 'Operate with flow and control',
        steps: [
          { id: 'exchange', label: es ? 'Exchange' : 'Exchange' },
          { id: 'mode', label: es ? 'Modo' : 'Mode' },
          { id: 'risk', label: es ? 'Riesgo' : 'Risk' },
          { id: 'command', label: es ? 'Centro' : 'Center' },
        ],
      };
    case 'security':
      return {
        title: es ? 'Seguridad' : 'Security',
        subtitle: es ? 'Protege tu sesión y acceso' : 'Protect your session and access',
        steps: [
          { id: '2fa', label: '2FA' },
          { id: 'sessions', label: es ? 'Sesiones' : 'Sessions' },
          { id: 'lock', label: es ? 'Bloqueo' : 'Lock' },
          { id: 'review', label: es ? 'Revisar' : 'Review' },
        ],
      };
    default:
      return {
        title: es ? 'Empezar' : 'Get started',
        subtitle: es ? 'Astra se adapta a tu pantalla actual' : 'Astra adapts to your current screen',
        steps: [
          { id: 'wallet', label: es ? 'Wallet' : 'Wallet' },
          { id: 'market', label: es ? 'Mercado' : 'Market' },
          { id: 'trade', label: es ? 'Trade' : 'Trade' },
          { id: 'profile', label: es ? 'Perfil' : 'Profile' },
        ],
      };
  }
}

function getFlowConfig(
  language: ChatLanguage,
  context: AstraSupportContext,
  activeGuide: AstraGuideProgress | null,
): FlowConfig {
  return getGuideFlow(language, activeGuide?.guideId) ?? getSurfaceFlow(language, context);
}

function getCurrentStep(activeGuide: AstraGuideProgress | null, maxSteps: number) {
  if (!activeGuide) {
    return 1;
  }

  return Math.max(1, Math.min(activeGuide.stepIndex + 1, maxSteps));
}

function mapStoreMessagesToChat(messages: AstraMessage[], language: ChatLanguage): AstraChatMessageItem[] {
  const createMemecoinLabel = language === 'es' ? 'Crear memecoin' : 'Create memecoin';
  const viewMarketLabel = language === 'es' ? 'Ver mercado' : 'View market';

  return messages.map((message) => {
    const chips =
      message.role === 'assistant'
        ? [
            ...((message.response?.actions ?? []).map((action) => ({
              id: action.id,
              label: action.label,
              tone: action.tone === 'primary' ? 'primary' : 'secondary',
              action,
            })) as AstraQuickChipItem[]),
          ]
        : [];

    const hasChip = (id: string) => chips.some((chip) => chip.id === id);

    if (
      message.role === 'assistant' &&
      message.response?.actionAliases?.includes('create_memecoin') &&
      !hasChip('alias-create-memecoin')
    ) {
      chips.push({
        id: 'alias-create-memecoin',
        label: createMemecoinLabel,
        tone: 'primary',
        action: {
          id: 'astra-alias-create-memecoin',
          label: createMemecoinLabel,
          icon: 'rocket-outline',
          tone: 'primary',
          kind: 'open_screen',
          targetScreen: 'create_token',
        },
      });
    }

    if (
      message.role === 'assistant' &&
      message.response?.actionAliases?.includes('view_market') &&
      !hasChip('alias-view-market')
    ) {
      chips.push({
        id: 'alias-view-market',
        label: viewMarketLabel,
        tone: 'secondary',
        action: {
          id: 'astra-alias-view-market',
          label: viewMarketLabel,
          icon: 'stats-chart-outline',
          tone: 'secondary',
          kind: 'open_screen',
          targetScreen: 'markets',
        },
      });
    }

    return {
      id: message.id,
      role: message.role,
      text: message.response?.body ?? message.text,
      chips: chips.length > 0 ? chips : undefined,
    };
  });
}

function createCurrentModuleAction(
  language: ChatLanguage,
  context: AstraSupportContext,
): AstraAction | null {
  const es = language === 'es';

  switch (context.surface) {
    case 'wallet':
      return {
        id: 'astra-open-current-wallet',
        label: es ? 'Abrir billetera' : 'Open wallet',
        icon: 'wallet-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'wallet',
      };
    case 'trade':
      return {
        id: 'astra-open-current-trade',
        label: es ? 'Ir a operar' : 'Go to trade',
        icon: 'swap-horizontal-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'trade',
      };
    case 'market':
      return {
        id: 'astra-open-current-market',
        label: es ? 'Ver mercado' : 'View market',
        icon: 'stats-chart-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'markets',
      };
    case 'social':
      return {
        id: 'astra-open-current-social',
        label: es ? 'Abrir Social' : 'Open Social',
        icon: 'people-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'social',
      };
    case 'create_token':
      return {
        id: 'astra-open-current-create-token',
        label: es ? 'Abrir crear token' : 'Open create token',
        icon: 'rocket-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'create_token',
      };
    case 'bot_futures':
      return {
        id: 'astra-open-current-bot-futures',
        label: es ? 'Abrir Bot Futures' : 'Open Bot Futures',
        icon: 'flash-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'bot_futures',
      };
    case 'security':
      return {
        id: 'astra-open-current-security',
        label: es ? 'Abrir seguridad' : 'Open security',
        icon: 'shield-checkmark-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'security',
      };
    case 'profile':
      return {
        id: 'astra-open-current-profile',
        label: es ? 'Abrir perfil' : 'Open profile',
        icon: 'person-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'profile',
      };
    default:
      return null;
  }
}

export default function AstraScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView | null>(null);
  const clearConversation = useAstraStore((state) => state.clearConversation);
  const voicePreferences = useAstraStore((state) => state.voicePreferences);
  const setVoiceMuted = useAstraStore((state) => state.setVoiceMuted);
  const openVoice = useAstraStore((state) => state.openVoice);
  const ask = useAstraStore((state) => state.ask);
  const storeMessages = useAstraStore((state) => state.messages);
  const storeTyping = useAstraStore((state) => state.isTyping);
  const activeGuide = useAstraStore((state) => state.activeGuide);
  const startGuide = useAstraStore((state) => state.startGuide);
  const resumeGuide = useAstraStore((state) => state.resumeGuide);
  const advanceGuide = useAstraStore((state) => state.advanceGuide);
  const retreatGuide = useAstraStore((state) => state.retreatGuide);
  const cancelGuide = useAstraStore((state) => state.cancelGuide);
  const pauseGuide = useAstraStore((state) => state.pauseGuide);
  const appendUserMessage = useAstraStore((state) => state.appendUserMessage);
  const pushAssistantResponse = useAstraStore((state) => state.pushAssistantResponse);
  const primeConversation = useAstraStore((state) => state.primeConversation);
  const context = useAstraStore((state) => state.context);
  const { colors } = useAppTheme();
  const appLanguage = useOrbitStore((state) => state.settings.language);
  const language: ChatLanguage = appLanguage === 'es' ? 'es' : 'en';
  const copy = COPY[language];
  const astraContext = useMemo(
    () => context ?? createFallbackContext(language),
    [context, language],
  );
  const [draft, setDraft] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (storeMessages.length > 0) {
      return;
    }

    const bootstrap = buildAstraBootstrapResponse(astraContext);
    primeConversation(astraContext, [createAstraMessage('assistant', bootstrap.body, bootstrap)]);
  }, [astraContext, primeConversation, storeMessages.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 60);

    return () => clearTimeout(timer);
  }, [storeMessages, storeTyping]);

  const messages = useMemo(
    () => mapStoreMessagesToChat(storeMessages, language),
    [language, storeMessages],
  );
  const flow = useMemo(
    () => getFlowConfig(language, astraContext, activeGuide),
    [activeGuide, astraContext, language],
  );
  const currentStep = getCurrentStep(activeGuide, flow.steps.length);
  const currentModuleAction = useMemo(
    () => createCurrentModuleAction(language, astraContext),
    [astraContext, language],
  );
  const canSend = draft.trim().length > 0;

  const runOrbitAction = (action: AstraAction) => {
    executeAstraAction({
      action,
      context: astraContext,
      router,
    });
  };

  const handleQuickAction = (chip: AstraQuickChipItem) => {
    setMenuVisible(false);

    if (chip.action?.kind === 'resolve_with_astra') {
      const retryQuestion =
        chip.action.helper?.trim() || useAstraStore.getState().memory.lastQuestion?.trim();
      if (!retryQuestion) {
        return;
      }

      void ask(retryQuestion);
      return;
    }

    if (chip.action?.kind === 'start_guide' && chip.action.guideId) {
      appendUserMessage(chip.label);
      startGuide(chip.action.guideId);
      return;
    }

    if (chip.action?.kind === 'resume_guide' && chip.action.guideId) {
      appendUserMessage(chip.label);
      resumeGuide(chip.action.guideId);
      return;
    }

    if (chip.action?.kind === 'next_guide_step') {
      appendUserMessage(chip.label);
      advanceGuide(flow.steps.length);
      return;
    }

    if (chip.action?.kind === 'previous_guide_step') {
      appendUserMessage(chip.label);
      retreatGuide();
      return;
    }

    if (chip.action?.kind === 'cancel_guide') {
      appendUserMessage(chip.label);
      cancelGuide();
      return;
    }

    if (chip.action) {
      appendUserMessage(chip.label);

      if (chip.action.guideId) {
        startGuide(chip.action.guideId);
      }

      runOrbitAction(chip.action);
      return;
    }

    appendUserMessage(chip.label);
    void ask(chip.label);
  };

  const handleDraftSend = () => {
    const question = draft.trim();
    if (!question) {
      return;
    }

    setDraft('');
    void ask(question);
  };

  const handleClose = () => {
    useAstraStore.setState({
      isOpen: false,
      isExpanded: false,
      activeRequestId: null,
      isTyping: false,
    });
    router.back();
  };

  const resetChat = () => {
    cancelGuide();
    clearConversation();
    setMenuVisible(false);
  };

  const openCurrentModule = () => {
    if (!currentModuleAction) {
      return;
    }

    setMenuVisible(false);
    runOrbitAction(currentModuleAction);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <LinearGradient
          colors={[colors.background, withOpacity(colors.backgroundAlt, 0.98)]}
          style={styles.flex}
        >
          <View style={styles.chrome}>
            <AstraHeader
              title={copy.headerTitle}
              subtitle={copy.headerSubtitle}
              statusLabel={copy.active}
              menuOpen={menuVisible}
              onToggleMenu={() => setMenuVisible((current) => !current)}
              onClose={handleClose}
            />

            {menuVisible ? (
              <View
                style={[
                  styles.menu,
                  {
                    top: 86 + insets.top,
                    borderColor: withOpacity(colors.borderStrong, 0.56),
                    backgroundColor: withOpacity(colors.surface, 0.98),
                  },
                ]}
              >
                <Pressable style={styles.menuItem} onPress={resetChat}>
                  <Ionicons name="refresh-outline" size={16} color={colors.textSoft} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{copy.menuReset}</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setVoiceMuted(!voicePreferences.muted);
                    setMenuVisible(false);
                  }}
                >
                  <Ionicons
                    name={voicePreferences.muted ? 'volume-high-outline' : 'volume-mute-outline'}
                    size={16}
                    color={colors.textSoft}
                  />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>
                    {voicePreferences.muted ? copy.menuUnmute : copy.menuMute}
                  </Text>
                </Pressable>
                {currentModuleAction ? (
                  <Pressable style={styles.menuItem} onPress={openCurrentModule}>
                    <Ionicons name={currentModuleAction.icon as keyof typeof Ionicons.glyphMap} size={16} color={colors.textSoft} />
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{copy.menuOpenCurrent}</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.menuItem} onPress={handleClose}>
                  <Ionicons name="close-outline" size={16} color={colors.textSoft} />
                  <Text style={[styles.menuLabel, { color: colors.text }]}>{copy.menuClose}</Text>
                </Pressable>
              </View>
            ) : null}

            <AstraFlowStepper
              activeTitle={flow.title}
              subtitle={flow.subtitle}
              steps={flow.steps}
              currentStep={currentStep}
            />
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((message) => (
              <AstraMessageBubble
                key={message.id}
                message={message}
                onPressChip={handleQuickAction}
              />
            ))}

            {storeTyping ? (
              <View style={styles.typingRow}>
                <View
                  style={[
                    styles.typingBubble,
                    {
                      backgroundColor: withOpacity(colors.surfaceElevated, 0.96),
                      borderColor: withOpacity(colors.borderStrong, 0.52),
                    },
                  ]}
                >
                  <Text style={[styles.typingText, { color: colors.textMuted }]}>{copy.typing}</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.inputDock,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                borderTopColor: withOpacity(colors.borderStrong, 0.18),
              },
            ]}
          >
            <AstraInputBar
              value={draft}
              placeholder={copy.placeholder}
              onChangeText={setDraft}
              onSend={handleDraftSend}
              onVoice={() => openVoice('listen')}
              canSend={canSend}
            />
            <Text style={[styles.footerBrand, { color: colors.textMuted }]}>{copy.footerBrand}</Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  chrome: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  menu: {
    position: 'absolute',
    right: 16,
    zIndex: 40,
    borderWidth: 1,
    borderRadius: RADII.md,
    paddingVertical: 8,
    minWidth: 190,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  menuItem: {
    minHeight: 40,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },
  typingRow: {
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 8,
  },
  typingBubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typingText: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  inputDock: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  footerBrand: {
    textAlign: 'center',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
});
