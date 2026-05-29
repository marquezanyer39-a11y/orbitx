import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AstraAlertBanner } from '../components/AstraAlertBanner';
import { AstraFloatingOrb } from '../components/AstraFloatingOrb';
import { AstraMicroCard } from '../components/AstraMicroCard';
import { AstraVoiceModePlaceholder } from '../placeholders/AstraVoiceModePlaceholder';
import { AstraInbox } from '../screens/AstraInbox';
import { AstraConfirmationSheet } from '../sheets/AstraConfirmationSheet';
import { AstraInsightSheet } from '../sheets/AstraInsightSheet';
import { astraUiTheme } from '../theme/astraUiTheme';
import {
  astraSandboxAlertInsight,
  astraSandboxCriticalInsight,
  astraSandboxInboxItems,
  astraSandboxMicroCardInsight,
} from './astraMockInsights';

type SandboxPanel = 'components' | 'inbox';

export function AstraUiSandbox() {
  const [activePanel, setActivePanel] = useState<SandboxPanel>('components');
  const [insightVisible, setInsightVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [selectedInboxTitle, setSelectedInboxTitle] = useState<string | null>(null);

  const inboxTitle = useMemo(
    () => (selectedInboxTitle ? `Astra Inbox · ${selectedInboxTitle}` : 'Astra Inbox'),
    [selectedInboxTitle],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ASTRA UI SANDBOX</Text>
          <Text style={styles.title}>Previsualizacion aislada</Text>
          <Text style={styles.subtitle}>
            Este sandbox no toca navegacion, stores, EventBus ni pantallas reales. Todo esta
            controlado por props mock.
          </Text>
        </View>

        <View style={styles.tabRow}>
          <SandboxTab
            active={activePanel === 'components'}
            label="Componentes"
            onPress={() => setActivePanel('components')}
          />
          <SandboxTab
            active={activePanel === 'inbox'}
            label="Inbox"
            onPress={() => setActivePanel('inbox')}
          />
        </View>

        {activePanel === 'components' ? (
          <View style={styles.stack}>
            <SectionTitle
              title="AstraMicroCard"
              description="Insight compacto listo para superficies locales."
            />
            <AstraMicroCard
              insight={astraSandboxMicroCardInsight}
              accessoryLabel="Ambient"
              onPress={() => setInsightVisible(true)}
            />

            <SectionTitle
              title="AstraAlertBanner"
              description="Banner de alerta con tono warning y accion de demo."
            />
            <AstraAlertBanner
              title={astraSandboxAlertInsight.title}
              message={astraSandboxAlertInsight.body}
              tone="warning"
              actionLabel="Ver detalle"
              onAction={() => setInsightVisible(true)}
              onDismiss={() => setConfirmationVisible(true)}
            />

            <SectionTitle
              title="AstraFloatingOrb"
              description="Orb aislado. No se monta globalmente; aqui vive dentro del sandbox."
            />
            <View style={styles.orbPreview}>
              <AstraFloatingOrb
                visible
                label="Astra"
                unreadCount={3}
                bottomOffset={0}
                rightOffset={0}
                onPress={() => setInsightVisible(true)}
              />
            </View>

            <SectionTitle
              title="Sheets"
              description="Apertura local para probar AstraInsightSheet y AstraConfirmationSheet."
            />
            <View style={styles.buttonRow}>
              <SandboxButton
                label="Abrir InsightSheet"
                onPress={() => setInsightVisible(true)}
              />
              <SandboxButton
                label="Abrir ConfirmationSheet"
                onPress={() => setConfirmationVisible(true)}
              />
            </View>

            <SectionTitle
              title="Voice Placeholder"
              description="Placeholder visual, sin integracion de voz real."
            />
            <AstraVoiceModePlaceholder
              onPrimaryAction={() => setConfirmationVisible(true)}
            />
          </View>
        ) : (
          <View style={styles.stack}>
            <SectionTitle
              title="AstraInbox"
              description="Lista aislada con elementos mock para pruebas visuales."
            />
            <View style={styles.inboxWrap}>
              <AstraInbox
                title={inboxTitle}
                subtitle="Eventos mock listos para abrir en sandbox."
                items={astraSandboxInboxItems}
                onOpenItem={(item) => {
                  setSelectedInboxTitle(item.title);
                  setInsightVisible(true);
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <AstraInsightSheet
        visible={insightVisible}
        insight={astraSandboxCriticalInsight}
        primaryActionLabel="Cerrar demo"
        onPrimaryAction={() => setInsightVisible(false)}
        onClose={() => setInsightVisible(false)}
      />

      <AstraConfirmationSheet
        visible={confirmationVisible}
        title="Sandbox controlado"
        body="Esta confirmacion es solo visual. No dispara acciones reales, fondos, biometria ni tools."
        tone="critical"
        confirmLabel="Entendido"
        cancelLabel="Cerrar"
        onConfirm={() => setConfirmationVisible(false)}
        onCancel={() => setConfirmationVisible(false)}
      />
    </View>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function SandboxTab({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function SandboxButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: astraUiTheme.colors.background,
  },
  content: {
    paddingHorizontal: astraUiTheme.spacing.lg,
    paddingTop: astraUiTheme.spacing.xl,
    paddingBottom: astraUiTheme.spacing.xl,
    gap: astraUiTheme.spacing.lg,
  },
  header: {
    gap: astraUiTheme.spacing.xs,
  },
  eyebrow: {
    color: astraUiTheme.colors.accent,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  title: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.bold,
    fontSize: 24,
  },
  subtitle: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  tabRow: {
    flexDirection: 'row',
    gap: astraUiTheme.spacing.sm,
  },
  tab: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: astraUiTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
  },
  tabActive: {
    borderColor: astraUiTheme.colors.accent,
    backgroundColor: astraUiTheme.colors.surface,
  },
  tabLabel: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 12,
  },
  tabLabelActive: {
    color: astraUiTheme.colors.text,
  },
  stack: {
    gap: astraUiTheme.spacing.lg,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: astraUiTheme.colors.text,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 16,
  },
  sectionDescription: {
    color: astraUiTheme.colors.textMuted,
    fontFamily: astraUiTheme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  orbPreview: {
    minHeight: 116,
    borderRadius: astraUiTheme.radii.lg,
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
    backgroundColor: astraUiTheme.colors.surface,
    padding: astraUiTheme.spacing.lg,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: astraUiTheme.spacing.sm,
  },
  button: {
    minHeight: 42,
    borderRadius: astraUiTheme.radii.pill,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: astraUiTheme.colors.accent,
  },
  buttonLabel: {
    color: astraUiTheme.colors.background,
    fontFamily: astraUiTheme.fonts.semibold,
    fontSize: 13,
  },
  inboxWrap: {
    minHeight: 520,
    borderRadius: astraUiTheme.radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: astraUiTheme.colors.borderStrong,
  },
  pressed: {
    opacity: 0.84,
  },
});
