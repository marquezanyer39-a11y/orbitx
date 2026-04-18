import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useEffect } from 'react';

import { FONT, RADII } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useOrbitStore } from '../../store/useOrbitStore';
import { useUiStore } from '../../src/store/uiStore';

export function ToastHost() {
  const { colors } = useAppTheme();
  const legacyToast = useOrbitStore((state) => state.toast);
  const hideToast = useOrbitStore((state) => state.hideToast);
  const modernToast = useUiStore((state) => state.toast);
  const hideModernToast = useUiStore((state) => state.hideToast);
  const toast = modernToast ?? legacyToast;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (modernToast) {
        hideModernToast();
        return;
      }

      hideToast();
    }, 2200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hideModernToast, hideToast, modernToast, toast]);

  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutDown.duration(180)}
      pointerEvents="none"
      style={[
        styles.toast,
        {
          backgroundColor: colors.card,
          borderColor:
            toast.tone === 'success'
              ? colors.profitSoft
              : toast.tone === 'error'
                ? colors.lossSoft
                : colors.border,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 108,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADII.md,
    borderWidth: 1,
  },
  text: {
    fontFamily: FONT.medium,
    fontSize: 13,
  },
});
