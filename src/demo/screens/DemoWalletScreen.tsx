import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONT } from '../../../constants/theme';
import {
  DEMO_BLOCKED_ACTION_LABEL,
  DEMO_MODE_LABEL,
  QVEX_DEMO_BALANCES,
  QVEX_DEMO_WALLET_ACTIVITY,
} from '../qvexDemoData';

interface Props {
  onBlockedAction: (message?: string) => void;
}

const WALLET_ACTIONS = ['Enviar', 'Recibir', 'Retirar', 'Conectar wallet'] as const;

export function DemoWalletScreen({ onBlockedAction }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.demoBanner}>{DEMO_MODE_LABEL}</Text>
      <Text style={styles.title}>Wallet demo</Text>
      <Text style={styles.subtitle}>
        Billetera visual con balances y actividad de ejemplo, sin cuentas reales ni conexiones externas.
      </Text>

      <View style={styles.walletHero}>
        <Text style={styles.walletHeroTitle}>Patrimonio total</Text>
        <Text style={styles.walletHeroValue}>{QVEX_DEMO_BALANCES[0]?.value ?? 'USD 0.00'}</Text>
        <Text style={styles.walletHeroMeta}>Composicion simulada lista para exploracion segura.</Text>
      </View>

      <View style={styles.actionRow}>
        {WALLET_ACTIONS.map((action) => (
          <Pressable
            key={action}
            onPress={() => onBlockedAction(DEMO_BLOCKED_ACTION_LABEL)}
            style={styles.actionChip}
          >
            <Text style={styles.actionChipLabel}>{action}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad demo</Text>
        <View style={styles.activityList}>
          {QVEX_DEMO_WALLET_ACTIVITY.map((item) => (
            <View key={item.id} style={styles.activityRow}>
              <View style={styles.activityCopy}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
              </View>
              <Text
                style={[
                  styles.activityAmount,
                  item.tone === 'positive'
                    ? styles.positive
                    : item.tone === 'negative'
                      ? styles.negative
                      : styles.neutral,
                ]}
              >
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionChip: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(0,229,255,0.16)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionChipLabel: {
    color: '#F8FBFF',
    fontFamily: FONT.medium,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityAmount: {
    fontFamily: FONT.semibold,
    fontSize: 13,
  },
  activityCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  activityList: {
    gap: 10,
  },
  activityRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  activitySubtitle: {
    color: '#8EA0B8',
    fontFamily: FONT.regular,
    fontSize: 12,
  },
  activityTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 14,
  },
  demoBanner: {
    color: '#8BD8FF',
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  negative: {
    color: '#F87171',
  },
  neutral: {
    color: '#E5E7EB',
  },
  positive: {
    color: '#34D399',
  },
  screen: {
    gap: 18,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 16,
  },
  subtitle: {
    color: '#94A2B8',
    fontFamily: FONT.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  title: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 22,
  },
  walletHero: {
    backgroundColor: 'rgba(14,20,33,0.95)',
    borderColor: 'rgba(52,211,153,0.18)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  walletHeroMeta: {
    color: '#8EA0B8',
    fontFamily: FONT.regular,
    fontSize: 13,
  },
  walletHeroTitle: {
    color: '#91A0B6',
    fontFamily: FONT.medium,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  walletHeroValue: {
    color: '#F8FBFF',
    fontFamily: FONT.semibold,
    fontSize: 26,
  },
});
