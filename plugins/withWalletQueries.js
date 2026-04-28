const { withAndroidManifest, withInfoPlist, createRunOncePlugin } = require('expo/config-plugins');

const WALLET_SCHEMES = [
  'metamask',
  'trust',
  'trustwallet',
  'coinbasewallet',
  'cbwallet',
  'rainbow',
  'uniswap',
  'wc',
];

const WALLET_PACKAGES = [
  'io.metamask',
  'com.wallet.crypto.trustapp',
  'org.toshi',
  'com.coinbase.wallet',
  'me.rainbow',
  'app.uniswap.mobile',
];

function withWalletQueries(config) {
  config = withInfoPlist(config, (nextConfig) => {
    const currentSchemes = Array.isArray(nextConfig.modResults.LSApplicationQueriesSchemes)
      ? nextConfig.modResults.LSApplicationQueriesSchemes
      : [];
    const mergedSchemes = Array.from(new Set([...currentSchemes, ...WALLET_SCHEMES]));
    nextConfig.modResults.LSApplicationQueriesSchemes = mergedSchemes;
    return nextConfig;
  });

  config = withAndroidManifest(config, (nextConfig) => {
    const manifest = nextConfig.modResults.manifest;
    const currentQueries = Array.isArray(manifest.queries) ? manifest.queries : [];

    WALLET_PACKAGES.forEach((walletPackage) => {
      const alreadyExists = currentQueries.some((query) =>
        Array.isArray(query.package) &&
        query.package.some((entry) => entry.$?.['android:name'] === walletPackage),
      );

      if (!alreadyExists) {
        currentQueries.push({
          package: [{ $: { 'android:name': walletPackage } }],
        });
      }
    });

    WALLET_SCHEMES.forEach((scheme) => {
      const alreadyExists = currentQueries.some((query) =>
        Array.isArray(query.intent) &&
        query.intent.some((intent) =>
          Array.isArray(intent.data) &&
          intent.data.some((entry) => entry.$?.['android:scheme'] === scheme),
        ),
      );

      if (!alreadyExists) {
        currentQueries.push({
          intent: [
            {
              action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
              category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
              data: [{ $: { 'android:scheme': scheme } }],
            },
          ],
        });
      }
    });

    manifest.queries = currentQueries;
    return nextConfig;
  });

  return config;
}

module.exports = createRunOncePlugin(withWalletQueries, 'with-wallet-queries', '1.0.0');
