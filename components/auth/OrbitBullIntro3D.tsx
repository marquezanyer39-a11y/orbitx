import { Asset } from 'expo-asset';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { LinearGradient } from 'expo-linear-gradient';
import { Buffer } from 'buffer';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { RADII, withOpacity } from '../../constants/theme';
import { useAppTheme } from '../../hooks/useAppTheme';
import { devWarn } from '../../src/utils/devLog';

const DEFAULT_FALLBACK = require('../../assets/orbit-bull.png');
const DEFAULT_MODEL = require('../../assets/orbit-bull-intro.glb');

type RenderMode = 'loading' | 'ready' | 'fallback';
type SceneMode = 'idle' | 'loading';

interface OrbitBullIntro3DProps {
  size?: number;
  breathingIntensity?: number;
  glowIntensity?: number;
  compactMode?: boolean;
  entryDelay?: number;
  runOutOnSuccess?: boolean;
  fallbackImage?: ImageSourcePropType;
  autoRotate?: boolean;
  sceneMode?: SceneMode;
  onRunOutComplete?: () => void;
}

interface SceneHandle {
  dispose: () => void;
  startRunOut: () => void;
}

function toArrayBuffer(base64: string) {
  const bytes = Buffer.from(base64, 'base64');
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export const OrbitBullIntro3D = memo(function OrbitBullIntro3D({
  size = 280,
  breathingIntensity = 1,
  glowIntensity = 1,
  compactMode = false,
  entryDelay = 0,
  runOutOnSuccess = false,
  fallbackImage = DEFAULT_FALLBACK,
  autoRotate = true,
  sceneMode = 'idle',
  onRunOutComplete,
}: OrbitBullIntro3DProps) {
  const { colors } = useAppTheme();
  const shouldUseNative3D =
    Platform.OS !== 'web' && Constants.executionEnvironment !== 'storeClient';
  const [shouldMount3D, setShouldMount3D] = useState(false);
  const [renderMode, setRenderMode] = useState<RenderMode>(
    shouldUseNative3D ? 'loading' : 'fallback',
  );
  const [surfaceReady, setSurfaceReady] = useState(false);
  const sceneHandleRef = useRef<SceneHandle | null>(null);
  const didLaunchRef = useRef(false);
  const runOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRunOutCompleteRef = useRef(onRunOutComplete);
  const mountedRef = useRef(true);

  const idleScale = useSharedValue(1);
  const idleLift = useSharedValue(0);
  const idleTilt = useSharedValue(0);
  const idleGlow = useSharedValue(0.72);
  const wrapperScale = useSharedValue(1);
  const wrapperTranslateX = useSharedValue(0);
  const wrapperTranslateY = useSharedValue(0);
  const wrapperRotate = useSharedValue(0);
  const wrapperOpacity = useSharedValue(1);
  const fallbackOpacity = useSharedValue(1);
  const stageOpacity = useSharedValue(0);

  const stageHeight = Math.round(size * (compactMode ? 0.58 : 0.7));
  const stageWidth = size;
  const auraWidth = compactMode ? size * 0.66 : size * 0.78;
  const auraHeight = compactMode ? stageHeight * 0.48 : stageHeight * 0.56;
  const isLoadingMode = sceneMode === 'loading';
  const motionBoost = isLoadingMode ? 1.3 : 1;

  onRunOutCompleteRef.current = onRunOutComplete;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      sceneHandleRef.current?.dispose();
      sceneHandleRef.current = null;
      if (runOutTimerRef.current) {
        clearTimeout(runOutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldUseNative3D) {
      setRenderMode('fallback');
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const frameId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        setShouldMount3D(true);
      }, entryDelay + 260);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [entryDelay, shouldUseNative3D]);

  useEffect(() => {
    cancelAnimation(idleScale);
    cancelAnimation(idleLift);
    cancelAnimation(idleTilt);
    cancelAnimation(idleGlow);
    cancelAnimation(wrapperScale);
    cancelAnimation(wrapperTranslateX);
    cancelAnimation(wrapperTranslateY);
    cancelAnimation(wrapperRotate);
    cancelAnimation(wrapperOpacity);
    cancelAnimation(stageOpacity);

    if (runOutOnSuccess) {
      return;
    }

    idleScale.value = withDelay(
      entryDelay,
      withRepeat(
        withSequence(
          withTiming(1 + 0.018 * breathingIntensity * motionBoost + (isLoadingMode ? 0.012 : 0), {
            duration: compactMode ? 1420 : 1680,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(isLoadingMode ? 0.99 : 0.995, {
            duration: compactMode ? 1220 : 1440,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        false,
      ),
    );
    idleLift.value = withDelay(
      entryDelay,
      withRepeat(
        withSequence(
          withTiming(-(compactMode ? 3.2 : 4.1) * breathingIntensity * (isLoadingMode ? 1.08 : 0.9), {
            duration: compactMode ? 1340 : 1560,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(0, {
            duration: compactMode ? 1340 : 1560,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        false,
      ),
    );
    idleTilt.value = withDelay(
      entryDelay + 120,
      withRepeat(
        withSequence(
          withTiming(autoRotate ? (isLoadingMode ? -2.4 : -1.35) : -0.55, {
            duration: isLoadingMode ? 1880 : 2280,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(autoRotate ? (isLoadingMode ? 2.4 : 1.35) : 0.55, {
            duration: isLoadingMode ? 2060 : 2420,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        true,
      ),
    );
    idleGlow.value = withDelay(
      entryDelay,
      withRepeat(
        withSequence(
          withTiming((isLoadingMode ? 1.05 : 0.95) + glowIntensity * (isLoadingMode ? 0.11 : 0.08), {
            duration: compactMode ? 1180 : 1460,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(isLoadingMode ? 0.8 : 0.7, {
            duration: compactMode ? 1180 : 1460,
            easing: Easing.inOut(Easing.quad),
          }),
        ),
        -1,
        false,
      ),
    );

    wrapperOpacity.value = withTiming(1, { duration: 320 });
    wrapperScale.value = withTiming(1, { duration: 320 });
    wrapperTranslateX.value = withTiming(0, { duration: 320 });
    wrapperTranslateY.value = withTiming(0, { duration: 320 });
    wrapperRotate.value = withTiming(0, { duration: 320 });
    stageOpacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) });
  }, [
    autoRotate,
    breathingIntensity,
    compactMode,
    entryDelay,
    glowIntensity,
    idleGlow,
    idleLift,
    idleScale,
    idleTilt,
    runOutOnSuccess,
    sceneMode,
    stageOpacity,
    wrapperOpacity,
    wrapperRotate,
    wrapperScale,
    wrapperTranslateX,
    wrapperTranslateY,
  ]);

  useEffect(() => {
    if (renderMode === 'ready') {
      fallbackOpacity.value = withTiming(0.18, {
        duration: 540,
        easing: Easing.out(Easing.quad),
      });
      setSurfaceReady(true);
      return;
    }

    fallbackOpacity.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.quad),
    });
  }, [fallbackOpacity, renderMode]);

  useEffect(() => {
    if (!runOutOnSuccess || didLaunchRef.current) {
      return;
    }

    didLaunchRef.current = true;
    sceneHandleRef.current?.startRunOut();

    wrapperScale.value = withSequence(
      withTiming(compactMode ? 1.08 : 1.12, {
        duration: 160,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(compactMode ? 1.44 : 1.62, {
        duration: 620,
        easing: Easing.in(Easing.exp),
      }),
    );
    wrapperTranslateX.value = withTiming(compactMode ? size * 0.52 : size * 0.7, {
      duration: 720,
      easing: Easing.in(Easing.exp),
    });
    wrapperTranslateY.value = withSequence(
      withTiming(-size * 0.05, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(compactMode ? -size * 0.08 : -size * 0.12, {
        duration: 580,
        easing: Easing.in(Easing.exp),
      }),
    );
    wrapperRotate.value = withTiming(compactMode ? -8 : -12, {
      duration: 680,
      easing: Easing.in(Easing.exp),
    });
    wrapperOpacity.value = withSequence(
      withDelay(
        360,
        withTiming(0, {
          duration: 320,
          easing: Easing.out(Easing.quad),
        }),
      ),
    );
    idleGlow.value = withTiming(1.28 + glowIntensity * 0.1, {
      duration: 320,
      easing: Easing.out(Easing.quad),
    });

    runOutTimerRef.current = setTimeout(() => {
      onRunOutCompleteRef.current?.();
    }, 760);
  }, [
    compactMode,
    glowIntensity,
    idleGlow,
    runOutOnSuccess,
    size,
    wrapperOpacity,
    wrapperRotate,
    wrapperScale,
    wrapperTranslateX,
    wrapperTranslateY,
  ]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: stageOpacity.value * wrapperOpacity.value,
    transform: [
      { translateX: wrapperTranslateX.value },
      { translateY: wrapperTranslateY.value + idleLift.value },
      { rotateZ: `${wrapperRotate.value + idleTilt.value}deg` },
      { scale: wrapperScale.value * idleScale.value },
    ],
  }));

  const fallbackStyle = useAnimatedStyle(() => ({
    opacity: fallbackOpacity.value,
    transform: [{ scale: 0.98 + idleGlow.value * 0.04 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.14 + idleGlow.value * 0.36 * glowIntensity,
    transform: [{ scale: 0.96 + idleGlow.value * 0.08 }],
  }));

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      try {
        const [THREE, expoThreeModule, loaderModule] = await Promise.all([
          import('three'),
          import('expo-three'),
          import('three/examples/jsm/loaders/GLTFLoader'),
        ]);

        if (!mountedRef.current) {
          return;
        }

        const { Renderer } = expoThreeModule;
        const { GLTFLoader } = loaderModule;
        const asset = Asset.fromModule(DEFAULT_MODEL);
        await asset.downloadAsync();

        const assetUri = asset.localUri ?? asset.uri;
        const base64 = await FileSystem.readAsStringAsync(assetUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const arrayBuffer = toArrayBuffer(base64);

        const renderer = new (Renderer as unknown as new (props: Record<string, unknown>) => any)({
          gl,
          antialias: true,
          alpha: true,
        });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          compactMode ? 31 : 28,
          gl.drawingBufferWidth / gl.drawingBufferHeight,
          0.1,
          100,
        );
        camera.position.set(0, compactMode ? 0.08 : 0.16, compactMode ? 4.1 : 4.55);

        const ambientLight = new THREE.AmbientLight(0xffffff, compactMode ? 2.4 : 2.8);
        const keyLight = new THREE.DirectionalLight(0xffffff, compactMode ? 2.1 : 2.5);
        keyLight.position.set(3.8, 3.2, 5.2);
        const rimLight = new THREE.DirectionalLight(0x7b3fe4, compactMode ? 1.2 : 1.5);
        rimLight.position.set(-3.4, 2.1, -3.2);
        const fillLight = new THREE.PointLight(0x00ffa3, compactMode ? 0.95 : 1.2, 12);
        fillLight.position.set(0, -0.6, 2.8);

        scene.add(ambientLight, keyLight, rimLight, fillLight);

        const floorGlow = new THREE.Mesh(
          new THREE.CircleGeometry(compactMode ? 1.15 : 1.32, 48),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#7B3FE4'),
            transparent: true,
            opacity: compactMode ? 0.08 : 0.1,
          }),
        );
        floorGlow.rotation.x = -Math.PI / 2;
        floorGlow.position.set(0, compactMode ? -0.76 : -0.92, 0.1);
        scene.add(floorGlow);

        const loader = new GLTFLoader();
        const root = await new Promise<any>((resolve, reject) => {
          loader.parse(
            arrayBuffer,
            '',
            (gltf) => resolve(gltf.scene ?? gltf.scenes?.[0]),
            (error) => reject(error),
          );
        });

        if (!root) {
          throw new Error('No pudimos leer el modelo 3D del toro.');
        }

        root.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.frustumCulled = false;

            const material = Array.isArray(child.material)
              ? child.material
              : [child.material].filter(Boolean);

            material.forEach((entry: any) => {
              if ('metalness' in entry) {
                entry.metalness = Math.min(entry.metalness ?? 0.35, 0.72);
              }
              if ('roughness' in entry) {
                entry.roughness = Math.max(entry.roughness ?? 0.4, 0.26);
              }
              if ('envMapIntensity' in entry) {
                entry.envMapIntensity = compactMode ? 0.8 : 1;
              }
            });
          }
        });

        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const sizeVector = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(sizeVector.x, sizeVector.y, sizeVector.z) || 1;
        const scale = (compactMode ? 2.15 : 2.45) / maxSize;

        root.position.sub(center);
        root.position.y += compactMode ? -0.12 : -0.18;
        root.scale.setScalar(scale);
        root.rotation.set(0.1, -0.28, 0);
        scene.add(root);

        let isDisposed = false;
        let launchStartedAt = 0;
        let animationFrame = 0;
        const startedAt = Date.now();

        const renderLoop = () => {
          if (isDisposed || !mountedRef.current) {
            return;
          }

          animationFrame = requestAnimationFrame(renderLoop);
          const elapsed = (Date.now() - startedAt) / 1000;
          const idleBreath = Math.sin(elapsed * (isLoadingMode ? 1.75 : 1.4)) * 0.03 * breathingIntensity * motionBoost;
          const idleHead = Math.sin(elapsed * (isLoadingMode ? 0.95 : 0.7)) * (isLoadingMode ? 0.15 : 0.11);
          const lateralDrift = isLoadingMode ? Math.sin(elapsed * 0.58) * 0.07 : 0;
          const cameraDriftY = isLoadingMode ? Math.sin(elapsed * 0.42) * 0.04 : 0;
          camera.position.x = isLoadingMode ? Math.sin(elapsed * 0.32) * 0.08 : 0;
          camera.position.y = (compactMode ? 0.08 : 0.16) + cameraDriftY;
          camera.lookAt(0, compactMode ? -0.04 : 0.02, 0);

          if (!launchStartedAt) {
            root.position.x = lateralDrift;
            root.position.y =
              (compactMode ? -0.1 : -0.16) +
              idleBreath +
              (isLoadingMode ? Math.sin(elapsed * 0.88) * 0.02 : 0);
            root.rotation.x =
              0.08 + Math.sin(elapsed * 1.3) * 0.025 * breathingIntensity * motionBoost;
            root.rotation.y = -0.28 + (autoRotate ? idleHead : idleHead * 0.38);
            root.rotation.z = Math.sin(elapsed * (isLoadingMode ? 1.35 : 1.1)) * (isLoadingMode ? 0.022 : 0.015);
            root.scale.setScalar(
              scale *
                (1 +
                  Math.sin(elapsed * (isLoadingMode ? 1.75 : 1.4)) *
                    0.014 *
                    breathingIntensity *
                    motionBoost),
            );
            floorGlow.material.opacity =
              (compactMode ? 0.08 : 0.1) *
              (isLoadingMode ? 0.9 + ((Math.sin(elapsed * 1.6) + 1) / 2) * 0.35 : 1);
          } else {
            const launchProgress = Math.min(1, (Date.now() - launchStartedAt) / 720);
            const eased = 1 - (1 - launchProgress) ** 3;
            root.position.x = eased * (compactMode ? 1.15 : 1.45);
            root.position.y = (compactMode ? -0.08 : -0.14) - eased * (compactMode ? 0.32 : 0.42);
            root.position.z = eased * (compactMode ? 1.9 : 2.5);
            root.rotation.x = 0.08 + eased * 0.22;
            root.rotation.y = -0.28 - eased * 0.78;
            root.rotation.z = -eased * 0.22;
            root.scale.setScalar(scale * (1 + eased * (compactMode ? 0.44 : 0.62)));
            floorGlow.material.opacity = (compactMode ? 0.08 : 0.1) * (1 - eased);
          }

          renderer.render(scene, camera);
          gl.endFrameEXP();
        };

        sceneHandleRef.current = {
          startRunOut: () => {
            if (!launchStartedAt) {
              launchStartedAt = Date.now();
            }
          },
          dispose: () => {
            isDisposed = true;
            if (animationFrame) {
              cancelAnimationFrame(animationFrame);
            }
            scene.traverse((child: any) => {
              if (child.geometry?.dispose) {
                child.geometry.dispose();
              }

              if (Array.isArray(child.material)) {
                child.material.forEach((material: any) => material?.dispose?.());
              } else {
                child.material?.dispose?.();
              }
            });
            floorGlow.geometry.dispose();
            floorGlow.material.dispose();
            renderer.dispose?.();
          },
        };

        setRenderMode('ready');
        renderLoop();
      } catch (error) {
        devWarn('[OrbitX] OrbitBullIntro3D fallback', error);
        sceneHandleRef.current?.dispose();
        sceneHandleRef.current = null;
        if (mountedRef.current) {
          setRenderMode('fallback');
        }
      }
    },
    [autoRotate, breathingIntensity, compactMode, isLoadingMode, motionBoost],
  );

  const shellStyle = useMemo(
    () => [
      styles.shell,
      {
        width: stageWidth,
        height: stageHeight,
      },
    ],
    [stageHeight, stageWidth],
  );

  return (
    <View style={shellStyle} pointerEvents="none">
      <Animated.View
        style={[
          styles.auraWrap,
          glowStyle,
          {
            width: auraWidth,
            height: auraHeight,
          },
        ]}
      >
        <LinearGradient
          colors={[
            withOpacity(colors.primary, (isLoadingMode ? 0.28 : 0.22) * glowIntensity),
            withOpacity(colors.profit, (isLoadingMode ? 0.12 : 0.08) * glowIntensity),
            'transparent',
          ]}
          start={{ x: 0.08, y: 0.2 }}
          end={{ x: 0.92, y: 0.86 }}
          style={styles.fill}
        />
      </Animated.View>

      <Animated.View style={[styles.stageWrap, wrapperStyle]}>
        {shouldMount3D && renderMode !== 'fallback' ? (
          <GLView
            style={[
              styles.surface,
              {
                width: stageWidth,
                height: stageHeight,
                opacity: surfaceReady ? 1 : 0.01,
              },
            ]}
            onContextCreate={onContextCreate}
          />
        ) : null}

        <Animated.Image
          source={fallbackImage}
          resizeMode="contain"
          style={[
            styles.fallbackImage,
            fallbackStyle,
            {
              width: stageWidth,
              height: stageHeight,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  fill: {
    flex: 1,
  },
  auraWrap: {
    position: 'absolute',
    borderRadius: RADII.pill,
    overflow: 'hidden',
  },
  stageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: {
    backgroundColor: 'transparent',
  },
  fallbackImage: {
    position: 'absolute',
  },
});
