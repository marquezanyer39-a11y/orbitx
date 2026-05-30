import { LinearGradient } from 'expo-linear-gradient';
import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

interface LiveVideoOverlayProps {
  children?: ReactNode;
}

export const LiveVideoOverlay = memo(function LiveVideoOverlay({
  children,
}: LiveVideoOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(8,16,8,0.74)', 'transparent', 'rgba(8,16,8,0.88)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
});
