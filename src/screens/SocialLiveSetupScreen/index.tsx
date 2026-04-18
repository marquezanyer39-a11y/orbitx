import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FONT, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import type { CameraType } from 'expo-camera';
import type { SocialPostCategory } from '../../types/social';
import { useUiStore } from '../../store/uiStore';

const DEFAULT_LIVE_POSTER =
  'https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=1200&q=80';

const CATEGORIES: Array<{ key: SocialPostCategory; label: string }> = [
  { key: 'analysis', label: 'Analisis' },
  { key: 'news', label: 'Noticia' },
  { key: 'meme', label: 'Meme' },
];

export default function SocialLiveSetupScreen() {
  const { colors } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const {
    publishPost,
    startLiveBroadcast,
    endLiveBroadcast,
    posts,
    activeLivePostId,
  } = useSocialFeed('live');
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [coverUri, setCoverUri] = useState('');
  const [description, setDescription] = useState(
    'Abro directo para revisar mercado, flujo de majors y memes calientes en OrbitX.',
  );
  const [hashtags, setHashtags] = useState('#Live #BTC #Mercado');
  const [tokenSymbol, setTokenSymbol] = useState('BTC');
  const [category, setCategory] = useState<SocialPostCategory>('analysis');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [starting, setStarting] = useState(false);

  const activeLivePost = useMemo(
    () => posts.find((post) => post.id === activeLivePostId) ?? null,
    [activeLivePostId, posts],
  );

  const cleanedHashtags = useMemo(
    () =>
      hashtags
        .split(/[\s,]+/)
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
    [hashtags],
  );

  const canStartLive = Boolean(description.trim());

  const pickCover = async () => {
    const pickerPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!pickerPermission.granted) {
      showToast('Necesitamos acceso a tu galeria para elegir portada.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.82,
      allowsEditing: true,
      aspect: [9, 16],
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setCoverUri(result.assets[0].uri);
  };

  const handleStartLive = async () => {
    if (!canStartLive || starting) {
      return;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showToast('Activa el permiso de camara para salir en vivo.', 'error');
        return;
      }
    }

    setStarting(true);

    const post = publishPost({
      mediaType: 'image',
      mediaUri: coverUri || DEFAULT_LIVE_POSTER,
      posterUri: coverUri || DEFAULT_LIVE_POSTER,
      description,
      hashtags: cleanedHashtags,
      tokenSymbol,
      category,
      commentsEnabled,
      isLive: true,
      liveViewers: 1,
    });

    startLiveBroadcast(post.id);
    setStarting(false);
    showToast('Tu camara ya esta en vivo.', 'success');
  };

  const handleEndLive = () => {
    if (activeLivePost?.id) {
      endLiveBroadcast(activeLivePost.id);
    }

    showToast('Tu directo se ha cerrado.', 'info');
      router.replace({ pathname: '/social', params: { tab: 'live' } });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={StyleSheet.absoluteFill}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="video"
            mute
            active
          />
        ) : (
          <LinearGradient
            colors={['#060608', withOpacity(colors.primary, 0.16), '#030304']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <LinearGradient
          colors={[withOpacity('#040404', 0.82), 'transparent', withOpacity('#040404', 0.88)]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.circleButton,
            {
              backgroundColor: withOpacity(colors.overlay, 0.48),
              borderColor: withOpacity(colors.borderStrong, 0.72),
            },
          ]}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activeLivePost ? 'Estas en vivo' : 'Preparar directo'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {activeLivePost
              ? 'Tu camara esta visible y lista para recibir regalos.'
              : 'Activa tu camara y sal en vivo desde OrbitX.'}
          </Text>
        </View>

        <Pressable
          onPress={() => setFacing((current) => (current === 'front' ? 'back' : 'front'))}
          style={[
            styles.circleButton,
            {
              backgroundColor: withOpacity(colors.overlay, 0.48),
              borderColor: withOpacity(colors.borderStrong, 0.72),
            },
          ]}
        >
          <Ionicons name="camera-reverse-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      {activeLivePost ? (
        <View style={styles.liveMetaWrap}>
          <BlurView intensity={20} tint="dark" style={[styles.liveMetaCard, { borderColor: withOpacity(colors.loss, 0.26) }]}>
            <View
              style={[
                styles.livePill,
                {
                  backgroundColor: withOpacity(colors.loss, 0.18),
                  borderColor: withOpacity(colors.loss, 0.32),
                },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: colors.loss }]} />
              <Text style={[styles.livePillText, { color: colors.text }]}>En vivo</Text>
            </View>
            <Text style={[styles.liveMetaText, { color: colors.text }]}>
              {activeLivePost.liveViewers ?? 1} viendo
            </Text>
          </BlurView>
        </View>
      ) : null}

      {!permission?.granted ? (
        <View style={styles.permissionWrap}>
          <BlurView intensity={22} tint="dark" style={[styles.permissionCard, { borderColor: withOpacity(colors.primary, 0.22) }]}>
            <Ionicons name="videocam-outline" size={28} color={colors.primary} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>Activa tu camara</Text>
            <Text style={[styles.permissionBody, { color: colors.textMuted }]}>
              OrbitX necesita acceso a la camara para iniciar un directo real desde esta pantalla.
            </Text>
            <Pressable
              onPress={() => void requestPermission()}
              style={[
                styles.permissionButton,
                {
                  backgroundColor: colors.primary,
                  borderColor: withOpacity(colors.primary, 0.7),
                },
              ]}
            >
              <Text style={styles.permissionButtonLabel}>Permitir camara</Text>
            </Pressable>
          </BlurView>
        </View>
      ) : null}

      <View style={styles.bottomSheetWrap}>
        <BlurView intensity={28} tint="dark" style={[styles.bottomSheet, { borderColor: withOpacity(colors.primary, 0.22) }]}>
          {!activeLivePost ? (
            <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Configura tu en vivo</Text>
                <Pressable
                  onPress={pickCover}
                  style={[
                    styles.coverMiniButton,
                    {
                      backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="image-outline" size={14} color={colors.text} />
                  <Text style={[styles.coverMiniLabel, { color: colors.text }]}>Portada</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.coverCard,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.8),
                    borderColor: withOpacity(colors.primary, 0.18),
                  },
                ]}
              >
                <Image source={{ uri: coverUri || DEFAULT_LIVE_POSTER }} style={styles.coverImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', withOpacity('#040404', 0.78)]}
                  start={{ x: 0.5, y: 0.12 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.coverCaption, { color: colors.text }]}>Asi se vera tu directo en Explorar</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Descripcion</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Que vas a revisar en vivo"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={[
                    styles.input,
                    styles.inputLarge,
                    {
                      color: colors.text,
                      backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.text }]}>Hashtags</Text>
                <TextInput
                  value={hashtags}
                  onChangeText={setHashtags}
                  placeholder="#Live #BTC #Mercado"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                      borderColor: colors.border,
                    },
                  ]}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.formSection, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Token</Text>
                  <TextInput
                    value={tokenSymbol}
                    onChangeText={setTokenSymbol}
                    placeholder="BTC"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: withOpacity(colors.fieldBackground, 0.82),
                        borderColor: colors.border,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.formSection, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
                  <View style={styles.chipRow}>
                    {CATEGORIES.map((item) => {
                      const active = category === item.key;
                      return (
                        <Pressable
                          key={item.key}
                          onPress={() => setCategory(item.key)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active
                                ? withOpacity(colors.primary, 0.18)
                                : withOpacity(colors.fieldBackground, 0.82),
                              borderColor: active ? withOpacity(colors.primary, 0.28) : colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.chipLabel, { color: active ? colors.text : colors.textMuted }]}>
                            {item.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.toggleRow,
                  {
                    backgroundColor: withOpacity(colors.surfaceElevated, 0.86),
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.text }]}>Comentarios activos</Text>
                  <Text style={[styles.toggleCopy, { color: colors.textMuted }]}>
                    Deja que la comunidad responda mientras estas en directo.
                  </Text>
                </View>
                <Switch
                  value={commentsEnabled}
                  onValueChange={setCommentsEnabled}
                  thumbColor={colors.text}
                  trackColor={{
                    false: withOpacity(colors.textMuted, 0.26),
                    true: withOpacity(colors.primary, 0.48),
                  }}
                />
              </View>

              <Pressable
                onPress={() => void handleStartLive()}
                disabled={!canStartLive || starting}
                style={[
                  styles.goLiveButton,
                  {
                    backgroundColor: canStartLive ? colors.primary : withOpacity(colors.primary, 0.3),
                    borderColor: withOpacity(colors.primary, 0.66),
                    opacity: starting ? 0.72 : 1,
                  },
                ]}
              >
                <Ionicons name="radio" size={18} color="#0B0B0F" />
                <Text style={styles.goLiveLabel}>{starting ? 'Iniciando...' : 'Iniciar en vivo'}</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <View style={styles.activeLivePanel}>
              <Text style={[styles.activeLiveTitle, { color: colors.text }]}>Tu directo esta activo</Text>
              <Text style={[styles.activeLiveBody, { color: colors.textMuted }]}>
                La camara sigue abierta aqui. Los regalos que te envien apareceran sobre la transmision sin taparte.
              </Text>

              <View style={styles.activeLiveMetrics}>
                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: withOpacity(colors.surfaceElevated, 0.84), borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Directo</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>Activo</Text>
                </View>
                <View
                  style={[
                    styles.metricCard,
                    { backgroundColor: withOpacity(colors.surfaceElevated, 0.84), borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.metricLabel, { color: colors.textMuted }]}>Token</Text>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{activeLivePost.tokenSymbol ?? 'BTC'}</Text>
                </View>
              </View>

              <Pressable
                onPress={handleEndLive}
                style={[
                  styles.endLiveButton,
                  {
                    backgroundColor: withOpacity(colors.loss, 0.16),
                    borderColor: withOpacity(colors.loss, 0.26),
                  },
                ]}
              >
                <Ionicons name="stop-circle-outline" size={18} color={colors.loss} />
                <Text style={[styles.endLiveLabel, { color: colors.text }]}>Finalizar directo</Text>
              </Pressable>
            </View>
          )}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  liveMetaWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  liveMetaCard: {
    minHeight: 54,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  livePill: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  livePillText: {
    fontFamily: FONT.semibold,
    fontSize: 12,
  },
  liveMetaText: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  permissionWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  permissionCard: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 10,
    alignItems: 'center',
  },
  permissionTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  permissionBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 6,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonLabel: {
    color: '#0B0B0F',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  bottomSheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '64%',
  },
  sheetContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
  },
  coverMiniButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coverMiniLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  coverCard: {
    height: 120,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
  },
  coverCaption: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  formSection: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  inputLarge: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 40,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  toggleRow: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleCopy: {
    marginTop: 3,
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  goLiveButton: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  goLiveLabel: {
    color: '#0B0B0F',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
  activeLivePanel: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  activeLiveTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
  },
  activeLiveBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  activeLiveMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  metricLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  metricValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
  },
  endLiveButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  endLiveLabel: {
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
});
