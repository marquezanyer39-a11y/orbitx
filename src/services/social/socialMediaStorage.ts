import * as FileSystem from 'expo-file-system/legacy';

type SocialStoredMediaType = 'video' | 'image';

const SOCIAL_MEDIA_DIR = `${FileSystem.documentDirectory ?? ''}orbitx-social-media/`;

function guessExtension(uri: string, mediaType: SocialStoredMediaType) {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]{3,5})$/);
  if (match?.[1]) {
    return `.${match[1].toLowerCase()}`;
  }

  return mediaType === 'video' ? '.mp4' : '.jpg';
}

async function ensureSocialMediaDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('No pudimos preparar el almacenamiento local del dispositivo.');
  }

  const info = await FileSystem.getInfoAsync(SOCIAL_MEDIA_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(SOCIAL_MEDIA_DIR, { intermediates: true });
  }
}

export async function persistSocialMediaUri(
  sourceUri: string,
  mediaType: SocialStoredMediaType,
) {
  if (!sourceUri.trim()) {
    throw new Error('No recibimos un archivo valido para publicar.');
  }

  const isRemoteAsset = /^https?:\/\//i.test(sourceUri);
  const isAlreadyPersisted = sourceUri.startsWith(SOCIAL_MEDIA_DIR);

  if (isRemoteAsset || isAlreadyPersisted) {
    return sourceUri;
  }

  await ensureSocialMediaDirectory();

  const extension = guessExtension(sourceUri, mediaType);
  const destinationUri = `${SOCIAL_MEDIA_DIR}${mediaType}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}${extension}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
}
