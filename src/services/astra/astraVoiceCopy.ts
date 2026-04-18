import type { LanguageCode } from '../../../types';
import type { AstraVoiceState } from '../../types/astraVoice';

interface AstraVoiceCopy {
  title: string;
  subtitle: string;
  resting: string;
  listening: string;
  thinking: string;
  processing: string;
  responding: string;
  playing: string;
  connecting: string;
  reconnecting: string;
  requestingPermission: string;
  idle: string;
  error: string;
  transcriptLabel: string;
  responseLabel: string;
  permissionBody: string;
  permissionAction: string;
  retry: string;
  stop: string;
  close: string;
  start: string;
  speakAgain: string;
  mute: string;
  unmute: string;
  textMode: string;
  voiceMode: string;
  unavailableInExpoGo: string;
  waitingPrompt: string;
  emptyResponse: string;
  silencePaused: string;
}

const COPY: Record<'en' | 'es', AstraVoiceCopy> = {
  en: {
    title: 'Astra',
    subtitle: 'OrbitX intelligence',
    resting: 'At rest',
    listening: 'I am listening',
    thinking: 'I am thinking',
    processing: 'I am thinking',
    responding: 'I am thinking',
    playing: 'Speaking...',
    connecting: 'I am thinking',
    reconnecting: 'I am thinking',
    requestingPermission: 'I am thinking',
    idle: 'I am ready when you are.',
    error: 'We could not complete voice mode.',
    transcriptLabel: 'You said',
    responseLabel: 'Astra replied',
    permissionBody:
      'Astra needs microphone access to hear you. You can enable it and try again.',
    permissionAction: 'Enable microphone',
    retry: 'Try again',
    stop: 'Stop',
    close: 'Close',
    start: 'Talk to Astra',
    speakAgain: 'Play again',
    mute: 'Mute voice',
    unmute: 'Enable voice',
    textMode: 'Text only',
    voiceMode: 'Voice replies',
    unavailableInExpoGo:
      'Astra Voice needs a development build to use live speech recognition.',
    waitingPrompt: 'Speak naturally. I will keep the conversation flowing.',
    emptyResponse: 'Astra did not return a clear answer. Try speaking again.',
    silencePaused: 'Paused due to silence. Tap the pulse to continue.',
  },
  es: {
    title: 'Astra',
    subtitle: 'Inteligencia OrbitX',
    resting: 'En reposo',
    listening: 'Te escucho',
    thinking: 'Estoy pensando',
    processing: 'Estoy pensando',
    responding: 'Estoy pensando',
    playing: 'Hablando...',
    connecting: 'Estoy pensando',
    reconnecting: 'Estoy pensando',
    requestingPermission: 'Estoy pensando',
    idle: 'Estoy lista cuando quieras.',
    error: 'No pudimos completar el modo voz.',
    transcriptLabel: 'Tu dijiste',
    responseLabel: 'Astra respondio',
    permissionBody:
      'Astra necesita acceso al microfono para escucharte. Puedes habilitarlo e intentarlo de nuevo.',
    permissionAction: 'Habilitar microfono',
    retry: 'Intentar otra vez',
    stop: 'Detener',
    close: 'Cerrar',
    start: 'Hablar con Astra',
    speakAgain: 'Reproducir de nuevo',
    mute: 'Silenciar voz',
    unmute: 'Activar voz',
    textMode: 'Solo texto',
    voiceMode: 'Respuesta por voz',
    unavailableInExpoGo:
      'Astra Voice necesita una development build para usar reconocimiento de voz en vivo.',
    waitingPrompt: 'Habla natural. Mantendre la conversacion en curso.',
    emptyResponse: 'Astra no devolvio una respuesta clara. Intenta hablar otra vez.',
    silencePaused: 'Pausada por silencio. Toca el pulso para continuar.',
  },
};

export function getAstraVoiceCopy(language: LanguageCode) {
  return COPY[language === 'es' ? 'es' : 'en'];
}

export function getAstraVoiceStateLabel(language: LanguageCode, state: AstraVoiceState) {
  const copy = getAstraVoiceCopy(language);

  switch (state) {
    case 'paused':
      return copy.silencePaused;
    case 'requesting_permission':
      return copy.thinking;
    case 'connecting':
      return copy.thinking;
    case 'listening':
      return copy.listening;
    case 'transcribing':
      return copy.thinking;
    case 'processing':
      return copy.thinking;
    case 'responding':
      return copy.thinking;
    case 'speaking':
      return copy.playing;
    case 'reconnecting':
      return copy.thinking;
    case 'error':
      return copy.error;
    default:
      return copy.resting;
  }
}
