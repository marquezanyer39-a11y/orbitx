import { Image, StyleSheet, View } from 'react-native';

import { withOpacity } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
  size?: number;
  framed?: boolean;
}

const astraLogo = require('../../../assets/astra-logo.jpg');

export function AstraLogo({ size = 24, framed = false }: Props) {
  const { colors } = useAppTheme();

  if (!framed) {
    return <Image source={astraLogo} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View
      style={[
        styles.frame,
        {
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          backgroundColor: withOpacity(colors.surfaceElevated, 0.88),
          borderColor: withOpacity(colors.primary, 0.18),
          shadowColor: colors.primary,
        },
      ]}
    >
      <Image source={astraLogo} style={{ width: size, height: size, borderRadius: size / 2 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
