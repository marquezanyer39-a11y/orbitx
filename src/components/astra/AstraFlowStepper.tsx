import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { FONT, RADII, withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface FlowStep {
  id: string;
  label: string;
}

interface Props {
  activeTitle: string;
  subtitle: string;
  steps: FlowStep[];
  currentStep: number;
}

export function AstraFlowStepper({
  activeTitle,
  subtitle,
  steps,
  currentStep,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: withOpacity(colors.borderStrong, 0.5),
          backgroundColor: withOpacity(colors.surface, 0.94),
        },
      ]}
    >
      <View style={styles.track}>
        <View
          style={[
            styles.activeStep,
            {
              backgroundColor: withOpacity(colors.profit, 0.14),
              borderColor: withOpacity(colors.profit, 0.24),
            },
          ]}
        >
          <View
            style={[
              styles.activeIcon,
              {
                backgroundColor: withOpacity(colors.fieldBackground, 0.92),
                borderColor: withOpacity(colors.profit, 0.18),
              },
            ]}
          >
            <Ionicons name="wallet-outline" size={15} color={colors.textSoft} />
          </View>
          <Text style={[styles.activeLabel, { color: colors.text }]}>{activeTitle}</Text>
        </View>

        <View style={styles.pendingWrap}>
          {steps.map((step, index) => {
            const isPast = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;

            return (
              <View
                key={step.id}
                style={[
                  styles.pendingStep,
                  {
                    backgroundColor: isCurrent
                      ? withOpacity(colors.profit, 0.18)
                      : isPast
                        ? withOpacity(colors.profit, 0.1)
                        : withOpacity(colors.fieldBackground, 0.92),
                    borderColor: isCurrent
                      ? withOpacity(colors.profit, 0.24)
                      : withOpacity(colors.borderStrong, 0.45),
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSoft }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeStep: {
    flex: 1,
    minHeight: 50,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  activeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: FONT.semibold,
    fontSize: 17,
  },
  pendingWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  pendingStep: {
    width: 30,
    height: 44,
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ skewX: '-18deg' }],
  },
  subtitle: {
    fontFamily: FONT.medium,
    fontSize: 14,
  },
});
