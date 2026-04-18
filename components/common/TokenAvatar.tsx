import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FONT, RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';

interface TokenAvatarProps {
  label: string;
  color: string;
  logo?: string | null;
  size?: number;
}

export function TokenAvatar({
  label,
  color,
  logo,
  size = 42,
}: TokenAvatarProps) {
  const { colors } = useAppTheme();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [logo]);

  if (logo && !hasError) {
    return (
      <Image
        source={{ uri: logo }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceElevated,
          },
        ]}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <LinearGradient
      colors={[color, withOpacity(colors.background, 0.55)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text, fontSize: size * 0.34 }]}>
        {label.slice(0, 2).toUpperCase()}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontFamily: FONT.bold,
  },
});
