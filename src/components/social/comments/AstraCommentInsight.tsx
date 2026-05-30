import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface AstraCommentInsightProps {
  text: string;
}

export const AstraCommentInsight = memo(function AstraCommentInsight({
  text,
}: AstraCommentInsightProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="sparkles" size={18} color="#3FE56C" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: withOpacity('#00C853', 0.08),
    borderLeftWidth: 3,
    borderLeftColor: '#3FE56C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
    color: '#9CFFC0',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
