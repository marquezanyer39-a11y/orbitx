import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Screen } from '../../../components/common/Screen';

interface Props {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  backgroundMode?: 'default' | 'motionVideo' | 'plain';
}

export function ScreenContainer({
  children,
  contentContainerStyle,
  scrollable = true,
  backgroundMode = 'default',
}: Props) {
  return (
    <Screen
      scrollable={scrollable}
      contentContainerStyle={contentContainerStyle}
      backgroundMode={backgroundMode}
    >
      {children}
    </Screen>
  );
}
