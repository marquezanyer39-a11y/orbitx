import { useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  refreshAstraRemoteConfigOnce,
  type AstraRemoteConfigBootstrapResult,
} from './astraRemoteConfigBootstrap';

export interface AstraRemoteConfigRefreshHostProps {
  enabled?: boolean;
  refreshOnMount?: boolean;
  minIntervalMs?: number;
  onResult?: (result: AstraRemoteConfigBootstrapResult) => void;
  children?: ReactNode;
}

export function shouldRunAstraRemoteConfigRefreshHost(
  props: Pick<AstraRemoteConfigRefreshHostProps, 'enabled' | 'refreshOnMount'>,
): boolean {
  return props.enabled !== false && props.refreshOnMount === true;
}

export async function runAstraRemoteConfigRefreshHostEffect(
  props: AstraRemoteConfigRefreshHostProps,
): Promise<AstraRemoteConfigBootstrapResult | null> {
  if (!shouldRunAstraRemoteConfigRefreshHost(props)) {
    return null;
  }

  try {
    const result = await refreshAstraRemoteConfigOnce({
      minIntervalMs: props.minIntervalMs,
    });
    props.onResult?.(result);
    return result;
  } catch {
    return null;
  }
}

export function getAstraRemoteConfigRefreshHostChildren(
  children?: ReactNode,
): ReactNode {
  return children ?? null;
}

export function AstraRemoteConfigRefreshHost({
  enabled = true,
  refreshOnMount = false,
  minIntervalMs,
  onResult,
  children,
}: AstraRemoteConfigRefreshHostProps) {
  useEffect(() => {
    void runAstraRemoteConfigRefreshHostEffect({
      enabled,
      refreshOnMount,
      minIntervalMs,
      onResult,
    });
  }, [enabled, minIntervalMs, onResult, refreshOnMount]);

  return <>{getAstraRemoteConfigRefreshHostChildren(children)}</>;
}
