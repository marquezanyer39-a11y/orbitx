const appJson = require('./app.json');

module.exports = () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    orbitxBackendUrl: process.env.EXPO_PUBLIC_ORBITX_BACKEND_URL ?? '',
    astraBackendUrl: process.env.EXPO_PUBLIC_ASTRA_VOICE_API_URL ?? '',
  },
});
