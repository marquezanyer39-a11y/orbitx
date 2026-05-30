import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT, withOpacity } from '../../../../constants/theme';

interface SocialModulePlaceholderScreenProps {
  title: string;
  subtitle: string;
  bullets: string[];
}

export const SocialModulePlaceholderScreen = memo(function SocialModulePlaceholderScreen({
  title,
  subtitle,
  bullets,
}: SocialModulePlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.list}>
          {bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <View style={styles.dot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Arquitectura preparada</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#08090B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
    backgroundColor: withOpacity('#192219', 0.76),
    borderWidth: 1,
    borderColor: withOpacity('#3C4A3C', 0.22),
    gap: 12,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    color: '#DCE5D7',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    gap: 10,
    marginTop: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3FE56C',
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: '#A1A1AA',
    fontFamily: FONT.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 8,
    minHeight: 46,
    borderRadius: 23,
    backgroundColor: '#3FE56C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#003912',
    fontFamily: FONT.bold,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
});
