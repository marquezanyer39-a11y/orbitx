import { SocialModulePlaceholderScreen } from '../shared/SocialModulePlaceholderScreen';

export default function SocialCommentsOverlayScreen() {
  return (
    <SocialModulePlaceholderScreen
      title="Comments Overlay"
      subtitle="La arquitectura del overlay de comentarios ya vive como componente reutilizable. Esta pantalla host queda preparada para deep links o navegación modal dedicada."
      bullets={[
        'Host screen para comments por post o stream',
        'Entrada desde deep link /social/comments/[postId]',
        'Conexión futura con datos remotos y moderación Astra',
      ]}
    />
  );
}
