import { StyleSheet, Text, View } from 'react-native';

import { AstraRemoteConfigRefreshHost } from '../config/AstraRemoteConfigRefreshHost';
import { astraUiTheme } from '../ui/theme/astraUiTheme';

export function AstraQaRemoteConfigPanel() {
  return (
    <AstraRemoteConfigRefreshHost enabled refreshOnMount={false}>
      <View style={styles.panel} testID="astra-qa-remote-config-panel">
        <Text style={styles.title}>Remote Config RefreshHost</Text>
        <Text style={styles.subtitle}>
          Host exportado con refreshOnMount=false. Esta vista no consulta Supabase, no bloquea arranque y no
          modifica flags remotos.
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>enabled</Text>
          <Text style={styles.value}>true</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>refreshOnMount</Text>
          <Text style={styles.value}>false</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>delivery/push</Text>
          <Text style={styles.value}>disabled</Text>
        </View>
      </View>
    </AstraRemoteConfigRefreshHost>
  );
}

const styles = StyleSheet.create({
  label: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.medium,
    fontSize: 12,
  },
  panel: {
    backgroundColor: astraUiTheme.colors.surface,
    borderColor: astraUiTheme.colors.borderStrong,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    gap: astraUiTheme.spacing.md,
    padding: astraUiTheme.spacing.md,
  },
  row: {
    alignItems: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderRadius: astraUiTheme.radii.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: astraUiTheme.spacing.md,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 18,
  },
  value: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
});
