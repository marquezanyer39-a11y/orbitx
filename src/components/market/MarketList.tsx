import { View } from 'react-native';

import type { MarketPair } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { MarketRow } from './MarketRow';

interface Props {
  pairs: MarketPair[];
  onSelectPair: (pair: MarketPair) => void;
}

export function MarketList({ pairs, onSelectPair }: Props) {
  if (!pairs.length) {
    return (
      <EmptyState
        title="Mercado en actualizacion"
        body="Aun no hay activos disponibles para mostrar en este momento."
      />
    );
  }

  return (
    <View>
      {pairs.map((pair) => (
        <MarketRow key={pair.id} pair={pair} onPress={() => onSelectPair(pair)} />
      ))}
    </View>
  );
}
