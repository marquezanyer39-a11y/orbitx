import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../../constants/theme';
import { SOCIAL_DISCOVERY_STREAMS_MOCK } from '../../mocks/liveStreams.mock';
import { useSocialNavigator } from '../../navigation/SocialNavigator';

export default function StreamDiscoveryScreen() {
  const socialNavigator = useSocialNavigator();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="light" backgroundColor="#08090B" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={socialNavigator.back} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color="#FAFAFA" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Stream Discovery Demo</Text>
            <Text style={styles.subtitle}>
              Descubre lives simulados, war rooms de ejemplo y creators demo. Sin streaming real.
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {SOCIAL_DISCOVERY_STREAMS_MOCK.map((stream) => (
            <Pressable key={stream.id} onPress={socialNavigator.openLiveRoom} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
              <Image source={{ uri: stream.posterUri || stream.coverUri }} style={styles.cover} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(8,9,11,0.86)']}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE DEMO</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.streamTitle} numberOfLines={2}>
                  {stream.title}
                </Text>
                <Text style={styles.streamMeta}>
                  {stream.tokenSymbol ? `$${stream.tokenSymbol} · ` : ''}
                  {stream.viewerCount.toLocaleString()} viewers demo
                </Text>
                <Text style={styles.streamTags} numberOfLines={1}>
                  {stream.tags.join(' ')}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08090B',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withOpacity('#FAFAFA', 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity('#FAFAFA', 0.04),
  },
  headerCopy: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    color: '#A1A1AA',
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  list: {
    gap: 14,
  },
  card: {
    height: 244,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#141518',
  },
  cover: {
    ...StyleSheet.absoluteFillObject,
  },
  livePill: {
    position: 'absolute',
    top: 16,
    left: 16,
    minHeight: 28,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,77,77,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.28)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4D',
  },
  liveText: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  cardContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 6,
  },
  streamTitle: {
    color: '#FAFAFA',
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  streamMeta: {
    color: '#7FFF93',
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  streamTags: {
    color: '#DCE5D7',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
