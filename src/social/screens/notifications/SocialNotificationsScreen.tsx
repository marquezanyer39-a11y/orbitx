import { SocialModulePlaceholderScreen } from '../shared/SocialModulePlaceholderScreen';

export default function SocialNotificationsScreen() {
  return (
    <SocialModulePlaceholderScreen
      title="Social Notifications"
      subtitle="Centro social demo de follows, comentarios, gifts, lives y señales Astra. Sin notificaciones reales."
      bullets={[
        'Agrupación por tipo de evento',
        'Estado leído / no leído',
        'Conexión futura con notificaciones push y backend',
      ]}
    />
  );
}
