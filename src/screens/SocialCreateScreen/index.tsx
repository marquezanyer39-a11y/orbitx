import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
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

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSocialFeed } from '../../hooks/useSocialFeed';
import { moderateSocialDraft } from '../../services/social/contentModeration';
import { persistSocialMediaUri } from '../../services/social/socialMediaStorage';
import type { SocialPostCategory } from '../../types/social';
import { useUiStore } from '../../store/uiStore';

const CATEGORIES: Array<{ key: SocialPostCategory; label: string }> = [
  { key: 'analysis', label: 'Analisis' },
  { key: 'meme', label: 'Meme' },
  { key: 'news', label: 'Noticia' },
];

export default function SocialCreateScreen() {
  const { colors } = useAppTheme();
  const showToast = useUiStore((state) => state.showToast);
  const { publishPost } = useSocialFeed();
  const [mediaUri, setMediaUri] = useState('');
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('#btc #ideas');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [category, setCategory] = useState<SocialPostCategory>('analysis');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [preparingMedia, setPreparingMedia] = useState(false);

  const player = useVideoPlayer(
    mediaType === 'video' && mediaUri ? { uri: mediaUri } : null,
    (instance) => {
      instance.loop = true;
      instance.muted = true;
    },
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

  const canPublish = Boolean(mediaUri && description.trim());

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Necesitamos acceso a tu galeria para publicar contenido.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.82,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const nextMediaType = asset.type === 'video' ? 'video' : 'image';

    try {
      setPreparingMedia(true);
      const persistedMediaUri = await persistSocialMediaUri(asset.uri, nextMediaType);
      setMediaUri(persistedMediaUri);
      setPosterUri(nextMediaType === 'image' ? persistedMediaUri : null);
      setMediaType(nextMediaType);
    } catch (error) {
      setMediaUri(asset.uri);
      setPosterUri(nextMediaType === 'image' ? asset.uri : null);
      setMediaType(nextMediaType);
      showToast('Usaremos el archivo original para publicar este contenido.', 'info');
    } finally {
      setPreparingMedia(false);
    }
  };

  const handlePublish = async () => {
    if (!canPublish || publishing || preparingMedia) {
      return;
    }

    const draft = {
      mediaType,
      mediaUri,
      posterUri: mediaType === 'image' ? posterUri || mediaUri : null,
      description,
      hashtags: cleanedHashtags,
      tokenSymbol,
      category,
      commentsEnabled,
    } as const;
    const moderation = moderateSocialDraft(draft);
    if (!moderation.allowed) {
      showToast(moderation.reason ?? 'No pudimos aprobar este contenido.', 'error');
      return;
    }

    try {
      setPublishing(true);
      publishPost(draft);
      showToast('Contenido publicado en Explorar y en tu perfil.', 'success');
      router.replace('/social');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.circleButton, { backgroundColor: withOpacity(colors.surfaceElevated, 0.82), borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={18} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Crear contenido</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Videos e imagenes para la comunidad OrbitX.</Text>
          </View>
        </View>

        <Pressable onPress={pickMedia} style={[styles.mediaPicker, { backgroundColor: withOpacity(colors.surfaceElevated, 0.92), borderColor: withOpacity(colors.primary, 0.22) }]}>
          {mediaUri ? (
            mediaType === 'video' ? (
              <>
                <VideoView player={player} style={styles.previewMedia} nativeControls={false} contentFit="cover" surfaceType="textureView" />
                <View style={[styles.previewBadge, { backgroundColor: withOpacity(colors.overlay, 0.52) }]}>
                  <Ionicons name="videocam" size={14} color={colors.text} />
                  <Text style={[styles.previewBadgeLabel, { color: colors.text }]}>Video</Text>
                </View>
              </>
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
            )
          ) : (
            <View style={styles.mediaEmpty}>
              <Ionicons name="images-outline" size={24} color={colors.primary} />
              <Text style={[styles.mediaEmptyTitle, { color: colors.text }]}>Selecciona una imagen o video</Text>
              <Text style={[styles.mediaEmptyBody, { color: colors.textMuted }]}>Tu contenido aparecera en Explorar.</Text>
            </View>
          )}
        </Pressable>
        {preparingMedia ? (
          <Text style={[styles.helperCopy, { color: colors.textMuted }]}>
            Preparando tu archivo para publicarlo con mejor estabilidad...
          </Text>
        ) : null}

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>Descripcion</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Cuenta que estas viendo en el mercado"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.inputLarge, { color: colors.text, backgroundColor: withOpacity(colors.fieldBackground, 0.82), borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>Hashtags</Text>
          <TextInput
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="#btc #meme #alpha"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, backgroundColor: withOpacity(colors.fieldBackground, 0.82), borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.text }]}>Token mencionado</Text>
          <TextInput
            value={tokenSymbol}
            onChangeText={setTokenSymbol}
            placeholder="BTC"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={[styles.input, { color: colors.text, backgroundColor: withOpacity(colors.fieldBackground, 0.82), borderColor: colors.border }]}
          />
        </View>

        <View style={styles.formSection}>
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
                      backgroundColor: active ? withOpacity(colors.primary, 0.18) : withOpacity(colors.fieldBackground, 0.82),
                      borderColor: active ? withOpacity(colors.primary, 0.28) : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipLabel, { color: active ? colors.text : colors.textMuted }]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.toggleRow, { backgroundColor: withOpacity(colors.surfaceElevated, 0.86), borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.text }]}>Comentarios</Text>
            <Text style={[styles.toggleCopy, { color: colors.textMuted }]}>Decide si la comunidad puede responder a esta publicacion.</Text>
          </View>
          <Switch value={commentsEnabled} onValueChange={setCommentsEnabled} thumbColor={colors.text} trackColor={{ false: withOpacity(colors.textMuted, 0.26), true: withOpacity(colors.primary, 0.48) }} />
        </View>

        <Pressable
          onPress={() => void handlePublish()}
          disabled={!canPublish || publishing}
          style={[
            styles.publishButton,
            {
              backgroundColor: canPublish ? colors.primary : withOpacity(colors.primary, 0.32),
              borderColor: withOpacity(colors.primary, 0.68),
              opacity: publishing ? 0.74 : 1,
            },
          ]}
        >
          <Text style={styles.publishLabel}>{publishing ? 'Publicando...' : 'Publicar'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 24,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  mediaPicker: {
    height: 280,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    minHeight: 30,
    borderRadius: 16,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBadgeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 11,
  },
  mediaEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  mediaEmptyTitle: {
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  mediaEmptyBody: {
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  helperCopy: {
    fontFamily: FONT.medium,
    fontSize: 11,
    marginTop: -10,
  },
  formSection: {
    gap: 8,
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
    minHeight: 108,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 38,
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
    fontFamily: FONT.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  publishButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishLabel: {
    color: '#0B0B0F',
    fontFamily: FONT.bold,
    fontSize: 14,
  },
});
