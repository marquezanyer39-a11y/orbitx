type LocalAuthenticationModule = typeof import('expo-local-authentication');

let localAuthenticationModule: LocalAuthenticationModule | null = null;

async function getLocalAuthenticationModule() {
  if (localAuthenticationModule) {
    return localAuthenticationModule;
  }

  localAuthenticationModule = await import('expo-local-authentication');
  return localAuthenticationModule;
}

export async function getOrbitXBiometricAvailability() {
  const LocalAuthentication = await getLocalAuthenticationModule();
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return {
      available: false,
      enrolled: false,
      message: 'Tu dispositivo no tiene biometria disponible.',
    };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return {
      available: true,
      enrolled: false,
      message: 'Configura huella o rostro en tu telefono primero.',
    };
  }

  return {
    available: true,
    enrolled: true,
    message: 'Biometria lista',
  };
}

export async function enableBiometricsForOrbitX() {
  const availability = await getOrbitXBiometricAvailability();
  if (!availability.available) {
    return {
      ok: false,
      message: availability.message,
    };
  }

  if (!availability.enrolled) {
    return {
      ok: false,
      message: availability.message,
    };
  }

  const LocalAuthentication = await getLocalAuthenticationModule();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Activa biometria para QVEX',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return {
      ok: false,
      message: 'La verificacion biometrica no se completo.',
    };
  }

  return {
    ok: true,
    message: 'Biometria activada',
  };
}

export async function unlockOrbitXWithBiometrics() {
  const availability = await getOrbitXBiometricAvailability();
  if (!availability.available || !availability.enrolled) {
    return {
      ok: false,
      message: availability.message,
    };
  }

  const LocalAuthentication = await getLocalAuthenticationModule();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquea QVEX',
    cancelLabel: 'Cancelar',
    disableDeviceFallback: false,
  });

  if (!result.success) {
    return {
      ok: false,
      message: 'No se pudo desbloquear QVEX con biometria.',
    };
  }

  return {
    ok: true,
    message: 'QVEX desbloqueado',
  };
}
