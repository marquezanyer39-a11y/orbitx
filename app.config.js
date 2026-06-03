const appJson = require('./app.json');

module.exports = ({ config } = {}) => {
  const baseConfig = {
    ...appJson.expo,
    ...(config ?? {}),
  };
  const plugins = [...(baseConfig.plugins ?? []), 'expo-font', './plugins/withWalletQueries'];

  return {
    ...baseConfig,
    plugins: Array.from(new Set(plugins)),
    extra: {
      ...(baseConfig.extra ?? {}),
      orbitxBackendUrl: process.env.EXPO_PUBLIC_ORBITX_BACKEND_URL ?? '',
      astraBackendUrl: process.env.EXPO_PUBLIC_ASTRA_VOICE_API_URL ?? '',
      walletConnectProjectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    },
  };
};
