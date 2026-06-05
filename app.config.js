const appJson = require('./app.json');

function readOptionalUrl(value) {
  const normalized = `${value ?? ''}`.trim();
  if (!normalized) {
    return null;
  }

  if (
    normalized.includes('your-backend.example.com') ||
    normalized.includes('example.invalid') ||
    !/^https?:\/\//i.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

module.exports = ({ config } = {}) => {
  const baseConfig = {
    ...appJson.expo,
    ...(config ?? {}),
  };
  const orbitxBackendUrl = readOptionalUrl(process.env.EXPO_PUBLIC_ORBITX_BACKEND_URL);
  const astraBackendUrl = readOptionalUrl(process.env.EXPO_PUBLIC_ASTRA_VOICE_API_URL);
  const plugins = [
    ...(baseConfig.plugins ?? []).filter((plugin) => plugin !== 'expo-dev-client'),
    'expo-font',
    './plugins/withWalletQueries',
  ];

  return {
    ...baseConfig,
    plugins: Array.from(new Set(plugins)),
    extra: {
      ...(baseConfig.extra ?? {}),
      ...(orbitxBackendUrl ? { orbitxBackendUrl } : {}),
      ...(astraBackendUrl ? { astraBackendUrl } : {}),
      walletConnectProjectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    },
  };
};
