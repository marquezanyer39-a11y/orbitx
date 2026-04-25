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

import { pickLanguageText } from '../../../constants/i18n';
import { FONT, RADII, withOpacity } from '../../../constants/theme';
import type { LanguageCode } from '../../../types';
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

type ChatLanguage = LanguageCode;

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

const COPY: Partial<Record<ChatLanguage, ScreenCopy>> = {
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

function screenText(language: ChatLanguage, values: Partial<Record<LanguageCode, string>>) {
  return pickLanguageText(language, values, 'en');
}

function getScreenCopy(language: ChatLanguage): ScreenCopy {
  if (language === 'es' || language === 'en') {
    return COPY[language]!;
  }

  return {
    headerTitle: 'Astra',
    headerSubtitle: screenText(language, {
      en: 'OrbitX Assistant',
      pt: 'Assistente OrbitX',
      'zh-Hans': 'OrbitX \u52a9\u624b',
      hi: 'OrbitX \u0938\u0939\u093e\u092f\u0915',
      ru: '\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043d\u0442 OrbitX',
      ar: '\u0645\u0633\u0627\u0639\u062f OrbitX',
      id: 'Asisten OrbitX',
    }),
    active: screenText(language, {
      en: 'Active',
      pt: 'Ativa',
      'zh-Hans': '\u6d3b\u8dc3',
      hi: '\u0938\u0915\u094d\u0930\u093f\u092f',
      ru: '\u0410\u043a\u0442\u0438\u0432\u043d\u0430',
      ar: '\u0646\u0634\u0637\u0629',
      id: 'Aktif',
    }),
    placeholder: screenText(language, {
      en: 'Ask Astra anything',
      pt: 'Pergunte algo a Astra',
      'zh-Hans': '\u95ee Astra \u4efb\u4f55\u95ee\u9898',
      hi: 'Astra \u0938\u0947 \u0915\u0941\u091b \u092d\u0940 \u092a\u0942\u091b\u094b',
      ru: '\u0421\u043f\u0440\u043e\u0441\u0438 \u0447\u0442\u043e \u0443\u0433\u043e\u0434\u043d\u043e \u0443 Astra',
      ar: '\u0627\u0633\u0623\u0644 Astra \u0623\u064a \u0634\u064a\u0621',
      id: 'Tanyakan apa saja ke Astra',
    }),
    typing: screenText(language, {
      en: 'Astra is preparing the best next action...',
      pt: 'A Astra esta preparando a melhor proxima acao...',
      'zh-Hans': 'Astra \u6b63\u5728\u51c6\u5907\u6700\u4f73\u7684\u4e0b\u4e00\u6b65...',
      hi: 'Astra \u0905\u0917\u0932\u093e \u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u0915\u0926\u092e \u0924\u0948\u092f\u093e\u0930 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948...',
      ru: 'Astra \u0433\u043e\u0442\u043e\u0432\u0438\u0442 \u043b\u0443\u0447\u0448\u0435\u0435 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435...',
      ar: '\u062a\u062d\u0636\u0631 Astra \u0623\u0641\u0636\u0644 \u062e\u0637\u0648\u0629 \u062a\u0627\u0644\u064a\u0629...',
      id: 'Astra sedang menyiapkan langkah terbaik berikutnya...',
    }),
    menuReset: screenText(language, {
      en: 'Reset conversation',
      pt: 'Reiniciar conversa',
      'zh-Hans': '\u91cd\u7f6e\u5bf9\u8bdd',
      hi: '\u092c\u093e\u0924\u091a\u0940\u0924 \u0930\u0940\u0938\u0947\u091f \u0915\u0930\u0947\u0902',
      ru: '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0434\u0438\u0430\u043b\u043e\u0433',
      ar: '\u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629',
      id: 'Atur ulang percakapan',
    }),
    menuMute: screenText(language, {
      en: 'Mute voice',
      pt: 'Silenciar voz',
      'zh-Hans': '\u9759\u97f3',
      hi: '\u0906\u0935\u093e\u091c\u093c \u092e\u094d\u092f\u0942\u091f \u0915\u0930\u0947\u0902',
      ru: '\u0412\u044b\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a',
      ar: '\u0643\u062a\u0645 \u0627\u0644\u0635\u0648\u062a',
      id: 'Bisukan suara',
    }),
    menuUnmute: screenText(language, {
      en: 'Enable voice',
      pt: 'Ativar voz',
      'zh-Hans': '\u542f\u7528\u8bed\u97f3',
      hi: '\u0906\u0935\u093e\u091c\u093c \u091a\u093e\u0932\u0942 \u0915\u0930\u0947\u0902',
      ru: '\u0412\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0437\u0432\u0443\u043a',
      ar: '\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0635\u0648\u062a',
      id: 'Aktifkan suara',
    }),
    menuClose: screenText(language, {
      en: 'Close Astra',
      pt: 'Fechar Astra',
      'zh-Hans': '\u5173\u95ed Astra',
      hi: 'Astra \u092c\u0902\u0926 \u0915\u0930\u0947\u0902',
      ru: '\u0417\u0430\u043a\u0440\u044b\u0442\u044c Astra',
      ar: '\u0625\u063a\u0644\u0627\u0642 Astra',
      id: 'Tutup Astra',
    }),
    menuOpenCurrent: screenText(language, {
      en: 'Open current module',
      pt: 'Abrir modulo atual',
      'zh-Hans': '\u6253\u5f00\u5f53\u524d\u6a21\u5757',
      hi: '\u0935\u0930\u094d\u0924\u092e\u093e\u0928 module \u0916\u094b\u0932\u0947\u0902',
      ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u043c\u043e\u0434\u0443\u043b\u044c',
      ar: '\u0641\u062a\u062d \u0627\u0644\u0648\u062d\u062f\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629',
      id: 'Buka modul saat ini',
    }),
    footerBrand: 'OrbitX',
  };
}

function createFallbackContext(language: ChatLanguage): AstraSupportContext {
  return {
    surface: 'general',
    path: '/astra',
    language,
    screenName: getLocalizedAstraSurfaceLabel(language, 'general'),
    summary: screenText(language, {
      en: 'Astra is ready to help you inside OrbitX.',
      es: 'Astra lista para ayudarte dentro de OrbitX.',
      pt: 'A Astra esta pronta para ajudar voce dentro da OrbitX.',
      'zh-Hans': 'Astra \u5df2\u51c6\u5907\u597d\u5728 OrbitX \u5185\u5e2e\u52a9\u4f60\u3002',
      hi: 'Astra OrbitX \u0915\u0947 \u0905\u0902\u0926\u0930 \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u0940 \u092e\u0926\u0926 \u0915\u0947 \u0932\u093f\u090f \u0924\u0948\u092f\u093e\u0930 \u0939\u0948\u0964',
      ru: 'Astra \u0433\u043e\u0442\u043e\u0432\u0430 \u043f\u043e\u043c\u043e\u0433\u0430\u0442\u044c \u0442\u0435\u0431\u0435 \u0432\u043d\u0443\u0442\u0440\u0438 OrbitX.',
      ar: 'Astra \u062c\u0627\u0647\u0632\u0629 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u062f\u0627\u062e\u0644 OrbitX.',
      id: 'Astra siap membantumu di dalam OrbitX.',
    }),
  };
}

function getGuideFlow(language: ChatLanguage, guideId?: AstraGuideId | null): FlowConfig | null {
  switch (guideId) {
    case 'create_wallet':
      return {
        title: screenText(language, {
          en: 'Create wallet',
          es: 'Crear wallet',
          pt: 'Criar wallet',
          'zh-Hans': '\u521b\u5efa wallet',
          hi: 'Wallet \u092c\u0928\u093e\u090f\u0901',
          ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c wallet',
          ar: '\u0625\u0646\u0634\u0627\u0621 wallet',
          id: 'Buat wallet',
        }),
        subtitle: screenText(language, {
          en: 'Activate your Web3 space',
          es: 'Activa tu espacio Web3',
          pt: 'Ative seu espaco Web3',
          'zh-Hans': '\u542f\u7528\u4f60\u7684 Web3 \u7a7a\u95f4',
          hi: '\u0905\u092a\u0928\u093e Web3 space \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u0947\u0902',
          ru: '\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u0443\u0439 \u0441\u0432\u043e\u0451 Web3-\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e',
          ar: '\u0641\u0639\u0644 \u0645\u0633\u0627\u062d\u062a\u0643 Web3',
          id: 'Aktifkan ruang Web3 kamu',
        }),
        steps: [
          { id: 'wallet', label: 'Wallet' },
          { id: 'verify', label: screenText(language, { en: 'Verify', es: 'Verificar', pt: 'Verificar', 'zh-Hans': '\u9a8c\u8bc1', hi: '\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0915\u0930\u0947\u0902', ru: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c', ar: '\u062a\u062d\u0642\u0642', id: 'Verifikasi' }) },
          { id: 'protect', label: screenText(language, { en: 'Protect', es: 'Proteger', pt: 'Proteger', 'zh-Hans': '\u4fdd\u62a4', hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0947\u0902', ru: '\u0417\u0430\u0449\u0438\u0442\u0438\u0442\u044c', ar: '\u062d\u0645\u0627\u064a\u0629', id: 'Lindungi' }) },
          { id: 'activate', label: screenText(language, { en: 'Activate', es: 'Activar', pt: 'Ativar', 'zh-Hans': '\u6fc0\u6d3b', hi: '\u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u0947\u0902', ru: '\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u0442\u044c', ar: '\u062a\u0641\u0639\u064a\u0644', id: 'Aktifkan' }) },
        ],
      };
    case 'spot_trade':
      return {
        title: screenText(language, { en: 'Spot trade', es: 'Operar Spot', pt: 'Trade Spot', 'zh-Hans': '\u73b0\u8d27\u4ea4\u6613', hi: '\u0938\u094d\u092a\u0949\u091f \u091f\u094d\u0930\u0947\u0921', ru: '\u0421\u043f\u043e\u0442-\u0442\u043e\u0440\u0433\u043e\u0432\u043b\u044f', ar: '\u062a\u062f\u0627\u0648\u0644 Spot', id: 'Trade Spot' }),
        subtitle: screenText(language, { en: 'Review pair, context and entry', es: 'Revisa par, contexto y entrada', pt: 'Revise par, contexto e entrada', 'zh-Hans': '\u67e5\u770b\u4ea4\u6613\u5bf9\uff0c\u80cc\u666f\u548c\u5165\u573a', hi: '\u092a\u0947\u092f\u0930, context \u0914\u0930 entry \u0926\u0947\u0916\u0947\u0902', ru: '\u041f\u0440\u043e\u0432\u0435\u0440\u044c \u043f\u0430\u0440\u0443, \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442 \u0438 \u0432\u0445\u043e\u0434', ar: '\u0631\u0627\u062c\u0639 \u0627\u0644\u0632\u0648\u062c \u0648\u0627\u0644\u0633\u064a\u0627\u0642 \u0648\u0627\u0644\u062f\u062e\u0648\u0644', id: 'Tinjau pair, konteks, dan entry' }),
        steps: [
          { id: 'market', label: screenText(language, { en: 'Market', es: 'Mercado', pt: 'Mercado', 'zh-Hans': '\u5e02\u573a', hi: '\u092c\u093e\u091c\u093e\u0930', ru: '\u0420\u044b\u043d\u043e\u043a', ar: '\u0627\u0644\u0633\u0648\u0642', id: 'Pasar' }) },
          { id: 'pair', label: screenText(language, { en: 'Pair', es: 'Par', pt: 'Par', 'zh-Hans': '\u4ea4\u6613\u5bf9', hi: '\u092a\u0947\u092f\u0930', ru: '\u041f\u0430\u0440\u0430', ar: '\u0627\u0644\u0632\u0648\u062c', id: 'Pair' }) },
          { id: 'entry', label: screenText(language, { en: 'Entry', es: 'Entrada', pt: 'Entrada', 'zh-Hans': '\u5165\u573a', hi: '\u090f\u0902\u091f\u094d\u0930\u0940', ru: '\u0412\u0445\u043e\u0434', ar: '\u0627\u0644\u062f\u062e\u0648\u0644', id: 'Entry' }) },
          { id: 'confirm', label: screenText(language, { en: 'Confirm', es: 'Confirmar', pt: 'Confirmar', 'zh-Hans': '\u786e\u8ba4', hi: '\u092a\u0941\u0937\u094d\u091f\u093f \u0915\u0930\u0947\u0902', ru: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c', ar: '\u062a\u0623\u0643\u064a\u062f', id: 'Konfirmasi' }) },
        ],
      };
    case 'activate_security':
      return {
        title: screenText(language, { en: 'Security', es: 'Seguridad', pt: 'Seguranca', 'zh-Hans': '\u5b89\u5168', hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093e', ru: '\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c', ar: '\u0627\u0644\u0623\u0645\u0627\u0646', id: 'Keamanan' }),
        subtitle: screenText(language, { en: 'Protect your OrbitX account', es: 'Protege tu cuenta OrbitX', pt: 'Proteja sua conta OrbitX', 'zh-Hans': '\u4fdd\u62a4\u4f60\u7684 OrbitX \u8d26\u6237', hi: '\u0905\u092a\u0928\u093e OrbitX account \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0930\u0947\u0902', ru: '\u0417\u0430\u0449\u0438\u0442\u0438 \u0441\u0432\u043e\u0439 \u0430\u043a\u043a\u0430\u0443\u043d\u0442 OrbitX', ar: '\u0627\u062d\u0645 \u062d\u0633\u0627\u0628 OrbitX \u0627\u0644\u062e\u0627\u0635 \u0628\u0643', id: 'Lindungi akun OrbitX kamu' }),
        steps: [
          { id: '2fa', label: '2FA' },
          { id: 'sessions', label: screenText(language, { en: 'Sessions', es: 'Sesiones', pt: 'Sessoes', 'zh-Hans': '\u4f1a\u8bdd', hi: '\u0938\u0947\u0936\u0928', ru: '\u0421\u0435\u0441\u0441\u0438\u0438', ar: '\u0627\u0644\u062c\u0644\u0633\u0627\u062a', id: 'Sesi' }) },
          { id: 'lock', label: screenText(language, { en: 'Lock', es: 'Bloqueo', pt: 'Bloqueio', 'zh-Hans': '\u9501\u5b9a', hi: '\u0932\u0949\u0915', ru: '\u0411\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0430', ar: '\u0627\u0644\u0642\u0641\u0644', id: 'Kunci' }) },
          { id: 'review', label: screenText(language, { en: 'Review', es: 'Revisar', pt: 'Revisar', 'zh-Hans': '\u68c0\u67e5', hi: '\u0938\u092e\u0940\u0915\u094d\u0937\u093e', ru: '\u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c', ar: '\u0645\u0631\u0627\u062c\u0639\u0629', id: 'Tinjau' }) },
        ],
      };
    case 'buy_crypto':
      return {
        title: screenText(language, { en: 'Buy crypto', es: 'Comprar crypto', pt: 'Comprar crypto', 'zh-Hans': '\u8d2d\u4e70\u52a0\u5bc6\u8d44\u4ea7', hi: '\u0915\u094d\u0930\u093f\u092a\u094d\u091f\u094b \u0916\u0930\u0940\u0926\u0947\u0902', ru: '\u041a\u0443\u043f\u0438\u0442\u044c crypto', ar: '\u0634\u0631\u0627\u0621 crypto', id: 'Beli crypto' }),
        subtitle: screenText(language, { en: 'Choose provider and amount', es: 'Elige proveedor y monto', pt: 'Escolha provedor e valor', 'zh-Hans': '\u9009\u62e9\u63d0\u4f9b\u5546\u548c\u91d1\u989d', hi: '\u092a\u094d\u0930\u094b\u0935\u093e\u0907\u0921\u0930 \u0914\u0930 amount \u091a\u0941\u0928\u0947\u0902', ru: '\u0412\u044b\u0431\u0435\u0440\u0438 \u043f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440\u0430 \u0438 \u0441\u0443\u043c\u043c\u0443', ar: '\u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u0632\u0648\u062f \u0648\u0627\u0644\u0645\u0628\u0644\u063a', id: 'Pilih penyedia dan jumlah' }),
        steps: [
          { id: 'provider', label: screenText(language, { en: 'Provider', es: 'Proveedor', pt: 'Provedor', 'zh-Hans': '\u63d0\u4f9b\u5546', hi: '\u092a\u094d\u0930\u094b\u0935\u093e\u0907\u0921\u0930', ru: '\u041f\u0440\u043e\u0432\u0430\u0439\u0434\u0435\u0440', ar: '\u0627\u0644\u0645\u0632\u0648\u062f', id: 'Penyedia' }) },
          { id: 'amount', label: screenText(language, { en: 'Amount', es: 'Monto', pt: 'Valor', 'zh-Hans': '\u91d1\u989d', hi: '\u0930\u093e\u0936\u093f', ru: '\u0421\u0443\u043c\u043c\u0430', ar: '\u0627\u0644\u0645\u0628\u0644\u063a', id: 'Jumlah' }) },
          { id: 'payment', label: screenText(language, { en: 'Payment', es: 'Pago', pt: 'Pagamento', 'zh-Hans': '\u652f\u4ed8', hi: '\u092d\u0941\u0917\u0924\u093e\u0928', ru: '\u041e\u043f\u043b\u0430\u0442\u0430', ar: '\u0627\u0644\u062f\u0641\u0639', id: 'Pembayaran' }) },
          { id: 'confirm', label: screenText(language, { en: 'Confirm', es: 'Confirmar', pt: 'Confirmar', 'zh-Hans': '\u786e\u8ba4', hi: '\u092a\u0941\u0937\u094d\u091f\u093f \u0915\u0930\u0947\u0902', ru: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c', ar: '\u062a\u0623\u0643\u064a\u062f', id: 'Konfirmasi' }) },
        ],
      };
    default:
      return null;
  }
}

function getSurfaceFlow(language: ChatLanguage, context: AstraSupportContext): FlowConfig {
  const es = language === 'es';

  if (!es && language !== 'en') {
    switch (context.surface) {
      case 'social':
        return {
          title: 'Social',
          subtitle: screenText(language, {
            en: 'Explore content and profiles',
            pt: 'Explore conteudo e perfis',
            'zh-Hans': '\u63a2\u7d22\u5185\u5bb9\u548c\u4e2a\u4eba\u8d44\u6599',
            hi: '\u0915\u0902\u091f\u0947\u0902\u091f \u0914\u0930 profiles \u090f\u0915\u094d\u0938\u092a\u094d\u0932\u094b\u0930 \u0915\u0930\u0947\u0902',
            ru: '\u0418\u0437\u0443\u0447\u0430\u0439 \u043a\u043e\u043d\u0442\u0435\u043d\u0442 \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0438',
            ar: '\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062a',
            id: 'Jelajahi konten dan profil',
          }),
          steps: [
            { id: 'feed', label: 'Feed' },
            { id: 'profile', label: screenText(language, { en: 'Profile', pt: 'Perfil', 'zh-Hans': '\u4e2a\u4eba\u8d44\u6599', hi: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932', ru: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c', ar: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a', id: 'Profil' }) },
            { id: 'market', label: screenText(language, { en: 'Market', pt: 'Mercado', 'zh-Hans': '\u5e02\u573a', hi: '\u092c\u093e\u091c\u093e\u0930', ru: '\u0420\u044b\u043d\u043e\u043a', ar: '\u0627\u0644\u0633\u0648\u0642', id: 'Pasar' }) },
            { id: 'action', label: screenText(language, { en: 'Action', pt: 'Acao', 'zh-Hans': '\u64cd\u4f5c', hi: '\u0915\u093e\u0930\u094d\u0930\u0935\u093e\u0908', ru: '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435', ar: '\u0625\u062c\u0631\u0627\u0621', id: 'Aksi' }) },
          ],
        };
      case 'create_token':
        return {
          title: screenText(language, { en: 'Create token', pt: 'Criar token', 'zh-Hans': '\u521b\u5efa token', hi: 'Token \u092c\u0928\u093e\u090f\u0901', ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c token', ar: '\u0625\u0646\u0634\u0627\u0621 token', id: 'Buat token' }),
          subtitle: screenText(language, { en: 'Name, image and launch', pt: 'Nome, imagem e lancamento', 'zh-Hans': '\u540d\u79f0\u3001\u56fe\u50cf\u548c\u53d1\u5e03', hi: '\u0928\u093e\u092e, image \u0914\u0930 launch', ru: '\u0418\u043c\u044f, \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0438 \u0437\u0430\u043f\u0443\u0441\u043a', ar: '\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0644\u0625\u0637\u0644\u0627\u0642', id: 'Nama, gambar, dan peluncuran' }),
          steps: [
            { id: 'wallet', label: 'Wallet' },
            { id: 'config', label: screenText(language, { en: 'Config', pt: 'Config', 'zh-Hans': '\u914d\u7f6e', hi: '\u0915\u0949\u0928\u094d\u092b\u093f\u0917', ru: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430', ar: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f', id: 'Konfig' }) },
            { id: 'image', label: screenText(language, { en: 'Image', pt: 'Imagem', 'zh-Hans': '\u56fe\u50cf', hi: '\u0907\u092e\u0947\u091c', ru: '\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435', ar: '\u0635\u0648\u0631\u0629', id: 'Gambar' }) },
            { id: 'launch', label: screenText(language, { en: 'Launch', pt: 'Lancar', 'zh-Hans': '\u53d1\u5e03', hi: '\u0932\u0949\u0928\u094d\u091a', ru: '\u0417\u0430\u043f\u0443\u0441\u043a', ar: '\u0625\u0637\u0644\u0627\u0642', id: 'Luncurkan' }) },
          ],
        };
      case 'bot_futures':
        return {
          title: 'Bot Futures',
          subtitle: screenText(language, { en: 'Operate with flow and control', pt: 'Opere com fluxo e controle', 'zh-Hans': '\u4ee5\u6d41\u7a0b\u548c\u63a7\u5236\u6765\u64cd\u4f5c', hi: '\u092b\u094d\u0932\u094b \u0914\u0930 control \u0915\u0947 \u0938\u093e\u0925 operate \u0915\u0930\u0947\u0902', ru: '\u0420\u0430\u0431\u043e\u0442\u0430\u0439 \u0441 \u043f\u043e\u0442\u043e\u043a\u043e\u043c \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0435\u043c', ar: '\u0627\u0639\u0645\u0644 \u0628\u062a\u062f\u0641\u0642 \u0648\u062a\u062d\u0643\u0645', id: 'Operasikan dengan alur dan kontrol' }),
          steps: [
            { id: 'exchange', label: 'Exchange' },
            { id: 'mode', label: screenText(language, { en: 'Mode', pt: 'Modo', 'zh-Hans': '\u6a21\u5f0f', hi: '\u092e\u094b\u0921', ru: '\u0420\u0435\u0436\u0438\u043c', ar: '\u0627\u0644\u0648\u0636\u0639', id: 'Mode' }) },
            { id: 'risk', label: screenText(language, { en: 'Risk', pt: 'Risco', 'zh-Hans': '\u98ce\u9669', hi: '\u091c\u094b\u0916\u093f\u092e', ru: '\u0420\u0438\u0441\u043a', ar: '\u0627\u0644\u0645\u062e\u0627\u0637\u0631\u0629', id: 'Risiko' }) },
            { id: 'command', label: screenText(language, { en: 'Center', pt: 'Centro', 'zh-Hans': '\u4e2d\u5fc3', hi: '\u0938\u0947\u0902\u091f\u0930', ru: '\u0426\u0435\u043d\u0442\u0440', ar: '\u0627\u0644\u0645\u0631\u0643\u0632', id: 'Pusat' }) },
          ],
        };
      case 'security':
        return {
          title: screenText(language, { en: 'Security', pt: 'Seguranca', 'zh-Hans': '\u5b89\u5168', hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093e', ru: '\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c', ar: '\u0627\u0644\u0623\u0645\u0627\u0646', id: 'Keamanan' }),
          subtitle: screenText(language, { en: 'Protect your session and access', pt: 'Proteja sua sessao e acesso', 'zh-Hans': '\u4fdd\u62a4\u4f60\u7684\u4f1a\u8bdd\u548c\u8bbf\u95ee', hi: '\u0905\u092a\u0928\u0947 session \u0914\u0930 access \u0915\u0940 \u0930\u0915\u094d\u0937\u093e \u0915\u0930\u0947\u0902', ru: '\u0417\u0430\u0449\u0438\u0442\u0438 \u0441\u0435\u0441\u0441\u0438\u044e \u0438 \u0434\u043e\u0441\u0442\u0443\u043f', ar: '\u0627\u062d\u0645 \u062c\u0644\u0633\u062a\u0643 \u0648\u0627\u0644\u0648\u0635\u0648\u0644', id: 'Lindungi sesi dan aksesmu' }),
          steps: [
            { id: '2fa', label: '2FA' },
            { id: 'sessions', label: screenText(language, { en: 'Sessions', pt: 'Sessoes', 'zh-Hans': '\u4f1a\u8bdd', hi: '\u0938\u0947\u0936\u0928', ru: '\u0421\u0435\u0441\u0441\u0438\u0438', ar: '\u0627\u0644\u062c\u0644\u0633\u0627\u062a', id: 'Sesi' }) },
            { id: 'lock', label: screenText(language, { en: 'Lock', pt: 'Bloqueio', 'zh-Hans': '\u9501\u5b9a', hi: '\u0932\u0949\u0915', ru: '\u0411\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0430', ar: '\u0627\u0644\u0642\u0641\u0644', id: 'Kunci' }) },
            { id: 'review', label: screenText(language, { en: 'Review', pt: 'Revisar', 'zh-Hans': '\u68c0\u67e5', hi: '\u0938\u092e\u0940\u0915\u094d\u0937\u093e', ru: '\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430', ar: '\u0645\u0631\u0627\u062c\u0639\u0629', id: 'Tinjau' }) },
          ],
        };
      default:
        return {
          title: screenText(language, { en: 'Get started', pt: 'Comecar', 'zh-Hans': '\u5f00\u59cb', hi: '\u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902', ru: '\u041d\u0430\u0447\u0430\u0442\u044c', ar: '\u0627\u0628\u062f\u0623', id: 'Mulai' }),
          subtitle: screenText(language, { en: 'Astra adapts to your current screen', pt: 'A Astra se adapta a sua tela atual', 'zh-Hans': 'Astra \u4f1a\u9002\u5e94\u4f60\u5f53\u524d\u7684\u5c4f\u5e55', hi: 'Astra \u0924\u0941\u092e\u094d\u0939\u093e\u0930\u0940 current screen \u0915\u0947 \u0939\u093f\u0938\u093e\u092c \u0938\u0947 adapt \u0915\u0930\u0924\u0940 \u0939\u0948', ru: 'Astra \u0430\u0434\u0430\u043f\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u043a \u0442\u0435\u043a\u0443\u0449\u0435\u043c\u0443 \u044d\u043a\u0440\u0430\u043d\u0443', ar: 'Astra \u062a\u062a\u0643\u064a\u0641 \u0645\u0639 \u0634\u0627\u0634\u062a\u0643 \u0627\u0644\u062d\u0627\u0644\u064a\u0629', id: 'Astra menyesuaikan diri dengan layar saat ini' }),
          steps: [
            { id: 'wallet', label: 'Wallet' },
            { id: 'market', label: screenText(language, { en: 'Market', pt: 'Mercado', 'zh-Hans': '\u5e02\u573a', hi: '\u092c\u093e\u091c\u093e\u0930', ru: '\u0420\u044b\u043d\u043e\u043a', ar: '\u0627\u0644\u0633\u0648\u0642', id: 'Pasar' }) },
            { id: 'trade', label: 'Trade' },
            { id: 'profile', label: screenText(language, { en: 'Profile', pt: 'Perfil', 'zh-Hans': '\u4e2a\u4eba\u8d44\u6599', hi: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932', ru: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c', ar: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a', id: 'Profil' }) },
          ],
        };
    }
  }

  switch (context.surface) {
    case 'wallet':
      return {
        title: context.walletReady
          ? screenText(language, { en: 'Wallet ready', es: 'Wallet activa', pt: 'Wallet pronta', 'zh-Hans': 'Wallet \u5df2\u5c31\u7eea', hi: 'Wallet \u0924\u0948\u092f\u093e\u0930 \u0939\u0948', ru: 'Wallet \u0433\u043e\u0442\u043e\u0432', ar: 'Wallet \u062c\u0627\u0647\u0632\u0629', id: 'Wallet siap' })
          : screenText(language, { en: 'Create wallet', es: 'Crear wallet', pt: 'Criar wallet', 'zh-Hans': '\u521b\u5efa wallet', hi: 'Wallet \u092c\u0928\u093e\u090f\u0901', ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c wallet', ar: '\u0625\u0646\u0634\u0627\u0621 wallet', id: 'Buat wallet' }),
        subtitle: context.walletReady
          ? screenText(language, { en: 'Manage balance and security', es: 'Gestiona saldo y seguridad', pt: 'Gerencie saldo e seguranca', 'zh-Hans': '\u7ba1\u7406\u4f59\u989d\u4e0e\u5b89\u5168', hi: '\u092c\u0948\u0932\u0947\u0902\u0938 \u0914\u0930 security \u092e\u0948\u0928\u0947\u091c \u0915\u0930\u0947\u0902', ru: '\u0423\u043f\u0440\u0430\u0432\u043b\u044f\u0439 \u0431\u0430\u043b\u0430\u043d\u0441\u043e\u043c \u0438 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c\u044e', ar: '\u0623\u062f\u0631 \u0627\u0644\u0631\u0635\u064a\u062f \u0648\u0627\u0644\u0623\u0645\u0627\u0646', id: 'Kelola saldo dan keamanan' })
          : screenText(language, { en: 'Activate your Web3 space', es: 'Activa tu espacio Web3', pt: 'Ative seu espaco Web3', 'zh-Hans': '\u542f\u7528\u4f60\u7684 Web3 \u7a7a\u95f4', hi: '\u0905\u092a\u0928\u093e Web3 space \u0938\u0915\u094d\u0930\u093f\u092f \u0915\u0930\u0947\u0902', ru: '\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u0443\u0439 \u0441\u0432\u043e\u0451 Web3-\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0441\u0442\u0432\u043e', ar: '\u0641\u0639\u0644 \u0645\u0633\u0627\u062d\u062a\u0643 Web3', id: 'Aktifkan ruang Web3 kamu' }),
        steps: [
          { id: 'wallet', label: 'Wallet' },
          { id: 'fund', label: screenText(language, { en: 'Funds', es: 'Fondos', pt: 'Fundos', 'zh-Hans': '\u8d44\u91d1', hi: '\u092b\u0902\u0921\u094d\u0938', ru: '\u0421\u0440\u0435\u0434\u0441\u0442\u0432\u0430', ar: '\u0627\u0644\u0623\u0645\u0648\u0627\u0644', id: 'Dana' }) },
          { id: 'protect', label: screenText(language, { en: 'Security', es: 'Seguridad', pt: 'Seguranca', 'zh-Hans': '\u5b89\u5168', hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093e', ru: '\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c', ar: '\u0627\u0644\u0623\u0645\u0627\u0646', id: 'Keamanan' }) },
          { id: 'use', label: screenText(language, { en: 'Use', es: 'Usar', pt: 'Usar', 'zh-Hans': '\u4f7f\u7528', hi: '\u0909\u092a\u092f\u094b\u0917', ru: '\u0418\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c', ar: '\u0627\u0633\u062a\u062e\u062f\u0627\u0645', id: 'Gunakan' }) },
        ],
      };
    case 'trade':
      return {
        title: 'Trade',
        subtitle: screenText(language, { en: 'Operate with context and control', es: 'Opera con contexto y control', pt: 'Opere com contexto e controle', 'zh-Hans': '\u5728\u80cc\u666f\u4e0e\u63a7\u5236\u4e0b\u4ea4\u6613', hi: '\u0938\u0902\u0926\u0930\u094d\u092d \u0914\u0930 control \u0915\u0947 \u0938\u093e\u0925 trade \u0915\u0930\u0947\u0902', ru: '\u0422\u043e\u0440\u0433\u0443\u0439 \u0441 \u043a\u043e\u043d\u0442\u0435\u043a\u0441\u0442\u043e\u043c \u0438 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0435\u043c', ar: '\u062a\u062f\u0627\u0648\u0644 \u0628\u0633\u064a\u0627\u0642 \u0648\u062a\u062d\u0643\u0645', id: 'Trade dengan konteks dan kontrol' }),
        steps: [
          { id: 'market', label: screenText(language, { en: 'Market', es: 'Mercado', pt: 'Mercado', 'zh-Hans': '\u5e02\u573a', hi: '\u092c\u093e\u091c\u093e\u0930', ru: '\u0420\u044b\u043d\u043e\u043a', ar: '\u0627\u0644\u0633\u0648\u0642', id: 'Pasar' }) },
          { id: 'pair', label: screenText(language, { en: 'Pair', es: 'Par', pt: 'Par', 'zh-Hans': '\u4ea4\u6613\u5bf9', hi: '\u092a\u0947\u092f\u0930', ru: '\u041f\u0430\u0440\u0430', ar: '\u0627\u0644\u0632\u0648\u062c', id: 'Pair' }) },
          { id: 'risk', label: screenText(language, { en: 'Risk', es: 'Riesgo', pt: 'Risco', 'zh-Hans': '\u98ce\u9669', hi: '\u091c\u094b\u0916\u093f\u092e', ru: '\u0420\u0438\u0441\u043a', ar: '\u0627\u0644\u0645\u062e\u0627\u0637\u0631\u0629', id: 'Risiko' }) },
          { id: 'execute', label: screenText(language, { en: 'Execute', es: 'Ejecutar', pt: 'Executar', 'zh-Hans': '\u6267\u884c', hi: '\u0915\u093e\u0930\u094d\u092f\u093e\u0928\u094d\u0935\u093f\u0924 \u0915\u0930\u0947\u0902', ru: '\u0412\u044b\u043f\u043e\u043b\u043d\u0438\u0442\u044c', ar: '\u062a\u0646\u0641\u064a\u0630', id: 'Eksekusi' }) },
        ],
      };
    case 'market':
      return {
        title: screenText(language, { en: 'Markets', es: 'Mercados', pt: 'Mercados', 'zh-Hans': '\u5e02\u573a', hi: '\u092e\u093e\u0930\u094d\u0915\u0947\u091f\u094d\u0938', ru: '\u0420\u044b\u043d\u043a\u0438', ar: '\u0627\u0644\u0623\u0633\u0648\u0627\u0642', id: 'Pasar' }),
        subtitle: screenText(language, { en: 'Find your next pair', es: 'Encuentra tu siguiente par', pt: 'Encontre seu proximo par', 'zh-Hans': '\u627e\u5230\u4f60\u7684\u4e0b\u4e00\u4e2a\u4ea4\u6613\u5bf9', hi: '\u0905\u092a\u0928\u093e \u0905\u0917\u0932\u093e pair \u0922\u0942\u0902\u0922\u0947\u0902', ru: '\u041d\u0430\u0439\u0434\u0438 \u0441\u0432\u043e\u044e \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0443\u044e \u043f\u0430\u0440\u0443', ar: '\u0627\u0639\u062b\u0631 \u0639\u0644\u0649 \u0632\u0648\u062c\u0643 \u0627\u0644\u062a\u0627\u0644\u064a', id: 'Temukan pair berikutnya' }),
        steps: [
          { id: 'scan', label: screenText(language, { en: 'Scan', es: 'Escanear', pt: 'Escanear', 'zh-Hans': '\u626b\u63cf', hi: '\u0938\u094d\u0915\u0948\u0928', ru: '\u0421\u043a\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c', ar: '\u0645\u0633\u062d', id: 'Pindai' }) },
          { id: 'pair', label: screenText(language, { en: 'Pair', es: 'Par', pt: 'Par', 'zh-Hans': '\u4ea4\u6613\u5bf9', hi: '\u092a\u0947\u092f\u0930', ru: '\u041f\u0430\u0440\u0430', ar: '\u0627\u0644\u0632\u0648\u062c', id: 'Pair' }) },
          { id: 'context', label: screenText(language, { en: 'Context', es: 'Contexto', pt: 'Contexto', 'zh-Hans': '\u80cc\u666f', hi: '\u0938\u0902\u0926\u0930\u094d\u092d', ru: '\u041a\u043e\u043d\u0442\u0435\u043a\u0441\u0442', ar: '\u0627\u0644\u0633\u064a\u0627\u0642', id: 'Konteks' }) },
          { id: 'trade', label: 'Trade' },
        ],
      };
    case 'social':
      return {
        title: 'Social',
        subtitle: screenText(language, { en: 'Explore content and profiles', es: 'Explora contenido y perfiles', pt: 'Explore conteudo e perfis', 'zh-Hans': '\u63a2\u7d22\u5185\u5bb9\u548c\u4e2a\u4eba\u8d44\u6599', hi: '\u0915\u0902\u091f\u0947\u0902\u091f \u0914\u0930 profiles \u090f\u0915\u094d\u0938\u092a\u094d\u0932\u094b\u0930 \u0915\u0930\u0947\u0902', ru: '\u0418\u0437\u0443\u0447\u0430\u0439 \u043a\u043e\u043d\u0442\u0435\u043d\u0442 \u0438 \u043f\u0440\u043e\u0444\u0438\u043b\u0438', ar: '\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062a', id: 'Jelajahi konten dan profil' }),
        steps: [
          { id: 'feed', label: 'Feed' },
          { id: 'profile', label: screenText(language, { en: 'Profile', es: 'Perfil', pt: 'Perfil', 'zh-Hans': '\u4e2a\u4eba\u8d44\u6599', hi: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932', ru: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c', ar: '\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a', id: 'Profil' }) },
          { id: 'market', label: screenText(language, { en: 'Market', es: 'Mercado', pt: 'Mercado', 'zh-Hans': '\u5e02\u573a', hi: '\u092c\u093e\u091c\u093e\u0930', ru: '\u0420\u044b\u043d\u043e\u043a', ar: '\u0627\u0644\u0633\u0648\u0642', id: 'Pasar' }) },
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
  const createMemecoinLabel = screenText(language, {
    en: 'Create memecoin',
    es: 'Crear memecoin',
    pt: 'Criar memecoin',
    'zh-Hans': '\u521b\u5efa memecoin',
    hi: 'Memecoin \u092c\u0928\u093e\u090f\u0901',
    ru: '\u0421\u043e\u0437\u0434\u0430\u0442\u044c memecoin',
    ar: '\u0625\u0646\u0634\u0627\u0621 memecoin',
    id: 'Buat memecoin',
  });
  const viewMarketLabel = screenText(language, {
    en: 'View market',
    es: 'Ver mercado',
    pt: 'Ver mercado',
    'zh-Hans': '\u67e5\u770b\u5e02\u573a',
    hi: '\u092c\u093e\u091c\u093e\u0930 \u0926\u0947\u0916\u0947\u0902',
    ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u044b\u043d\u043e\u043a',
    ar: '\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642',
    id: 'Lihat pasar',
  });

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
  switch (context.surface) {
    case 'wallet':
      return {
        id: 'astra-open-current-wallet',
        label: screenText(language, {
          en: 'Open wallet',
          es: 'Abrir billetera',
          pt: 'Abrir carteira',
          'zh-Hans': '\u6253\u5f00\u94b1\u5305',
          hi: '\u0935\u0949\u0932\u0947\u091f \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u043e\u0448\u0435\u043b\u0435\u043a',
          ar: '\u0641\u062a\u062d \u0627\u0644\u0645\u062d\u0641\u0638\u0629',
          id: 'Buka wallet',
        }),
        icon: 'wallet-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'wallet',
      };
    case 'trade':
      return {
        id: 'astra-open-current-trade',
        label: screenText(language, {
          en: 'Go to trade',
          es: 'Ir a operar',
          pt: 'Ir para trade',
          'zh-Hans': '\u53bb\u4ea4\u6613',
          hi: '\u091f\u094d\u0930\u0947\u0921 \u092a\u0930 \u091c\u093e\u090f\u0902',
          ru: '\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u0442\u043e\u0440\u0433\u043e\u0432\u043b\u0435',
          ar: '\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0627\u0644\u062a\u062f\u0627\u0648\u0644',
          id: 'Buka trade',
        }),
        icon: 'swap-horizontal-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'trade',
      };
    case 'market':
      return {
        id: 'astra-open-current-market',
        label: screenText(language, {
          en: 'View market',
          es: 'Ver mercado',
          pt: 'Ver mercado',
          'zh-Hans': '\u67e5\u770b\u5e02\u573a',
          hi: '\u092c\u093e\u091c\u093e\u0930 \u0926\u0947\u0916\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0440\u044b\u043d\u043e\u043a',
          ar: '\u0639\u0631\u0636 \u0627\u0644\u0633\u0648\u0642',
          id: 'Lihat pasar',
        }),
        icon: 'stats-chart-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'markets',
      };
    case 'social':
      return {
        id: 'astra-open-current-social',
        label: screenText(language, {
          en: 'Open Social',
          es: 'Abrir Social',
          pt: 'Abrir Social',
          'zh-Hans': '\u6253\u5f00\u793e\u533a',
          hi: 'Social \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Social',
          ar: '\u0641\u062a\u062d Social',
          id: 'Buka Social',
        }),
        icon: 'people-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'social',
      };
    case 'create_token':
      return {
        id: 'astra-open-current-create-token',
        label: screenText(language, {
          en: 'Open create token',
          es: 'Abrir crear token',
          pt: 'Abrir criacao de token',
          'zh-Hans': '\u6253\u5f00\u521b\u5efa Token',
          hi: 'Create token \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u043e\u0437\u0434\u0430\u043d\u0438\u0435 token',
          ar: '\u0641\u062a\u062d \u0625\u0646\u0634\u0627\u0621 token',
          id: 'Buka buat token',
        }),
        icon: 'rocket-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'create_token',
      };
    case 'bot_futures':
      return {
        id: 'astra-open-current-bot-futures',
        label: screenText(language, {
          en: 'Open Bot Futures',
          es: 'Abrir Bot Futures',
          pt: 'Abrir Bot Futures',
          'zh-Hans': '\u6253\u5f00 Bot Futures',
          hi: 'Bot Futures \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Bot Futures',
          ar: '\u0641\u062a\u062d Bot Futures',
          id: 'Buka Bot Futures',
        }),
        icon: 'flash-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'bot_futures',
      };
    case 'security':
      return {
        id: 'astra-open-current-security',
        label: screenText(language, {
          en: 'Open security',
          es: 'Abrir seguridad',
          pt: 'Abrir seguranca',
          'zh-Hans': '\u6253\u5f00\u5b89\u5168',
          hi: '\u0938\u0941\u0930\u0915\u094d\u0937\u093e \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c',
          ar: '\u0641\u062a\u062d \u0627\u0644\u0623\u0645\u0627\u0646',
          id: 'Buka keamanan',
        }),
        icon: 'shield-checkmark-outline',
        tone: 'primary',
        kind: 'open_screen',
        targetScreen: 'security',
      };
    case 'profile':
      return {
        id: 'astra-open-current-profile',
        label: screenText(language, {
          en: 'Open profile',
          es: 'Abrir perfil',
          pt: 'Abrir perfil',
          'zh-Hans': '\u6253\u5f00\u4e2a\u4eba\u8d44\u6599',
          hi: '\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932 \u0916\u094b\u0932\u0947\u0902',
          ru: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043f\u0440\u043e\u0444\u0438\u043b\u044c',
          ar: '\u0641\u062a\u062d \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062e\u0635\u064a',
          id: 'Buka profil',
        }),
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
  const language: ChatLanguage = appLanguage;
  const copy = getScreenCopy(language);
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
