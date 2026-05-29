import { StyleSheet, Text, View } from 'react-native';

import {
  AstraInternalQaHub,
  canRenderAstraQaHubDevOnly,
  createAstraQaHubSandboxFlags,
} from '../../src/astra/qa';

const qaHubFlags = createAstraQaHubSandboxFlags();

export default function AstraQaDevRoute() {
  const canRender = canRenderAstraQaHubDevOnly({
    isDev: __DEV__,
    flags: qaHubFlags,
  });

  if (!canRender) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableText}>QA Hub no disponible</Text>
      </View>
    );
  }

  return <AstraInternalQaHub enabled flags={qaHubFlags} initialTab="status" />;
}

const styles = StyleSheet.create({
  unavailableContainer: {
    alignItems: 'center',
    backgroundColor: '#08090B',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  unavailableText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
