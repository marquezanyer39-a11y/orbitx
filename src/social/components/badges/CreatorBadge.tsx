import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../../constants/theme';

export const CreatorBadge = memo(function CreatorBadge() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>CREATOR</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    minHeight: 18,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(0,200,83,0.16)',
    justifyContent: 'center',
  },
  label: {
    color: '#7FFF93',
    fontFamily: FONT.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
});
