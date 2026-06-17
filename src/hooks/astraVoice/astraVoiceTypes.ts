import type { ExpoSpeechRecognitionResultEvent } from 'expo-speech-recognition';

export type SpeechRecognitionModuleType =
  typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

export type SpeechModuleType = typeof import('expo-speech');

export type ListenerHandle = { remove: () => void };

export type AstraVoicePermissionResult = { granted: boolean };

export interface RecognitionPreflightResult {
  chosenServicePackage: string | null;
}

export type AstraVoiceResultEvent = ExpoSpeechRecognitionResultEvent;
