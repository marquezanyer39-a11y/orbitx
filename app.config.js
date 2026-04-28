const appJson = require('./app.json');

module.exports = () => ({
  ...appJson.expo,
  plugins: [...(appJson.expo.plugins ?? []), './plugins/withWalletQueries'],
  extra: {
    ...appJson.expo.extra,
    orbitxBackendUrl: process.env.EXPO_PUBLIC_ORBITX_BACKEND_URL ?? '',
    astraBackendUrl: process.env.EXPO_PUBLIC_ASTRA_VOICE_API_URL ?? '',
    walletConnectProjectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  },
});
