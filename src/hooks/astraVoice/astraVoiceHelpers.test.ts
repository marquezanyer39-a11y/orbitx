import { describe, expect, it } from 'vitest';

import type { AstraResponse } from '../../types/astra';
import {
  buildFallbackSession,
  buildFallbackSuggestions,
  chooseRecognitionService,
  inferTtsContext,
  isExpired,
  mapSurfaceToVoiceScreen,
} from './astraVoiceHelpers';

describe('astraVoiceHelpers', () => {
  it('prefiere el servicio de reconocimiento por defecto si esta instalado', () => {
    expect(
      chooseRecognitionService(
        ['com.google.android.as', 'com.example.voice'],
        'com.example.voice',
      ),
    ).toBe('com.example.voice');
  });

  it('elige un servicio preferido o el primero disponible', () => {
    expect(chooseRecognitionService(['com.google.android.googlequicksearchbox'], null)).toBe(
      'com.google.android.googlequicksearchbox',
    );
    expect(chooseRecognitionService(['com.vendor.voice'], null)).toBe('com.vendor.voice');
    expect(chooseRecognitionService([], null)).toBeNull();
  });

  it('clasifica contexto TTS sin depender de audio real', () => {
    expect(inferTtsContext('Revisa este riesgo antes de continuar')).toBe('alert');
    expect(inferTtsContext('Listo, se completó correctamente')).toBe('confirm');
    expect(inferTtsContext('Hola, soy Astra')).toBe('welcome');
    expect(inferTtsContext('Te explico tu portafolio')).toBe('explain');
  });

  it('normaliza superficies conocidas y desconocidas para el payload de voz', () => {
    expect(mapSurfaceToVoiceScreen('wallet')).toBe('wallet');
    expect(mapSurfaceToVoiceScreen('bot_futures')).toBe('bot_futures');
    expect(mapSurfaceToVoiceScreen(undefined)).toBe('general');
  });

  it('detecta sesiones expiradas con margen de seguridad', () => {
    const now = Date.UTC(2026, 0, 1);
    expect(isExpired(null, now)).toBe(true);
    expect(isExpired({ expiresAt: new Date(now + 20_000).toISOString() } as never, now)).toBe(
      true,
    );
    expect(isExpired({ expiresAt: new Date(now + 60_000).toISOString() } as never, now)).toBe(
      false,
    );
  });

  it('crea fallback local y sugerencias deduplicadas', () => {
    const session = buildFallbackSession({
      hasBrainBackend: false,
      outputMode: 'device_tts',
      now: Date.UTC(2026, 0, 1),
    });

    expect(session.model).toBe('local-astra-fallback');
    expect(session.transport).toBe('turn_based_voice');

    const response: AstraResponse = {
      mode: 'quick',
      intent: 'general',
      title: 'Astra',
      body: 'Respuesta',
      actions: [
        {
          id: 'wallet',
          label: 'Abrir billetera',
          icon: 'wallet-outline',
          kind: 'open_screen',
          targetScreen: 'wallet',
        },
      ],
      steps: ['Abrir billetera', 'Revisar saldo', 'Actualizar saldo', 'Confirmar red'],
    };

    expect(buildFallbackSuggestions(response)).toEqual([
      'Abrir billetera',
      'Revisar saldo',
      'Actualizar saldo',
      'Confirmar red',
    ]);
  });
});
