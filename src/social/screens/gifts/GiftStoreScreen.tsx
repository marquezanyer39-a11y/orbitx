import { SocialModulePlaceholderScreen } from '../shared/SocialModulePlaceholderScreen';

export default function GiftStoreScreen() {
  return (
    <SocialModulePlaceholderScreen
      title="Gift Store Demo"
      subtitle="Tienda social para gifts, packs premium y economía creator."
      bullets={[
        'Vista demo: no mueve dinero real',
        'Catálogo mock inicial',
        'Integración futura con earnings y supporters',
        'Sin pagos reales activados en esta fase',
      ]}
    />
  );
}
