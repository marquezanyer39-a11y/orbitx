# Limpieza Controlada Lint — OrbitX

## 0. Baseline inicial
- Total warnings antes: 53
- Distribución por tipo:

| Regla | Cantidad |
|---|---:|
| `@typescript-eslint/no-unused-vars` | 53 |

## 1. Resumen ejecutivo
- Warnings antes: 53
- Warnings después: 1
- Warnings corregidos: 52
- Warnings pendientes documentados: 1
- Errores: 0 antes y 0 después

La limpieza fue quirúrgica: solo se eliminaron imports, variables, parámetros o tipos no usados, o se prefijaron nombres locales no usados con `_` cuando convenía conservar el código visual para uso futuro. No se cambiaron dependencias de hooks, feature flags, balances, Web3, WalletConnect core, Trading Adapter ni Ledger.

## 2. Warnings por categoría
| Categoría | Cantidad | Corregidos | Pendientes |
|---|---:|---:|---:|
| A — Seguros | 48 | 48 | 0 |
| B — Con verificación | 4 | 4 | 0 |
| C — No tocar | 1 | 0 | 1 |

## 3. Archivos modificados
| Archivo | Warnings antes | Warnings después | Tipo de corrección |
|---|---:|---:|---|
| `components/common/GlassCard.tsx` | 1 | 0 | Import no usado |
| `components/common/OrbitBullLoader.tsx` | 1 | 0 | Import no usado |
| `components/common/Screen.tsx` | 12 | 0 | Import no usado + nombres locales `_...` |
| `components/common/SegmentedControl.tsx` | 1 | 0 | Import no usado |
| `components/common/TokenAvatar.tsx` | 1 | 0 | Import no usado |
| `components/home/HomeHeader.tsx` | 1 | 0 | Prop no usada fuera del destructuring |
| `components/home/QuickActions.tsx` | 1 | 0 | Import no usado |
| `components/wallet/WalletSetupFlow.tsx` | 1 | 0 | Variable no usada |
| `src/components/astra/AstraMessageBubble.tsx` | 1 | 0 | Import no usado |
| `src/components/botFutures/*.tsx` | 6 | 0 | Imports no usados |
| `src/components/rewardsPool/*.tsx` | 3 | 0 | Imports no usados |
| `src/components/trade/*.tsx` | 4 | 0 | Imports no usados |
| `src/components/wallet/RampActionGrid.tsx` | 1 | 0 | Import no usado |
| `src/screens/AstraScreen/index.tsx` | 3 | 0 | Tipo y selectores no usados |
| `src/screens/BotFuturesStrategyScreen/index.tsx` | 1 | 0 | Hook/variable no usados |
| `src/screens/CreateTokenScreen/PublicationConfigScreen.tsx` | 1 | 0 | Variable no usada |
| `src/screens/FavoritesScreen/index.tsx` | 2 | 0 | Imports no usados |
| `src/screens/MonthlyRewardsPoolScreen/index.tsx` | 2 | 0 | Imports no usados |
| `src/screens/ProfileScreen/index.tsx` | 1 | 0 | Prop no usada fuera del destructuring |
| `src/screens/SecurityScreen/index.tsx` | 1 | 0 | Variable no usada |
| `src/screens/SocialCreateScreen/index.tsx` | 2 | 0 | Import no usado + catch param no usado |
| `src/screens/SocialCreatorScreen/index.tsx` | 1 | 0 | Import no usado |
| `src/screens/TradeScreen/index.tsx` | 1 | 0 | Import no usado |
| `src/services/astra/astraCapabilities.ts` | 1 | 0 | Parámetro requerido prefijado `_context` |
| `src/services/ramp/providers/moonpayAdapter.ts` | 2 | 0 | Imports de tipos no usados |

## 4. Correcciones aplicadas

### Imports no usados
- Eliminados imports `SPACING`, `RADII`, `withOpacity`, `View`, `useMemo`, `RampConfig`, `RampFlowRequest`, `AstraResponse`, `mapLegacyTokenToMarketPair` y otros tipos/constantes no referenciados en los archivos listados arriba.

### Variables no usadas
- Eliminadas variables sin efectos: `progressSteps`, `securityTone`, `publicationStatus`, `colors`, selectores no usados de Astra y similares.
- En `components/common/Screen.tsx` se conservaron escenas/estilos visuales locales prefijándolos con `_` para no borrar código visual potencialmente reutilizable.

### Console.log eliminados
- No había `console.log` dentro del baseline de warnings. No se eliminaron logs en zonas sensibles.

### Tipos corregidos
- `src/services/astra/astraCapabilities.ts`: `context` pasó a `_context` porque la firma sigue recibiendo el contexto, pero la implementación actual no lo consume.

## 5. Warnings pendientes (Categoría C)
| Archivo | Línea | Regla | Razón para no corregir | Prioridad |
|---|---:|---|---|---|
| `src/services/walletConnectService.ts` | 259 | `@typescript-eslint/no-unused-vars` | Zona sensible WalletConnect. El warning es un `catch (error)` no usado, pero las reglas de esta fase solo permiten imports no usados en este archivo. Se conserva para evitar tocar flujo de carga runtime de WalletConnect/Reown. | Media — resolver en fase Web3/WalletConnect dedicada |

## 6. Zonas sensibles — Confirmación
- [x] Web3 / wallet signing: no modificado
- [x] WalletConnect core: no modificado
- [x] seed / private keys: no modificado
- [x] portfolioTotals / Home balance: no modificado
- [x] featureStatus: no modificado
- [x] Trading Adapter / Ledger (lógica): no modificado
- [x] useAstraVoice (lógica): no modificado
- [x] trading real: sigue deshabilitado
- [x] OKX: sigue sin conectar

## 7. Validación final
| Comando | Antes | Después |
|---|---|---|
| Errores lint | 0 | 0 |
| Warnings lint | 53 | 1 |
| `npx tsc --noEmit` / `npm run typecheck` | ✅ | ✅ |
| `npm test -- --passWithNoTests` | ✅ | ✅ |
| `npx expo-doctor` | ✅ | ✅ |

## 8. Siguiente paso recomendado
El siguiente paso razonable es una microfase dedicada a WalletConnect/Reown para decidir si el `catch (error)` pendiente se cambia a `catch` sin parámetro o si se registra con un logger seguro. Después de eso, OrbitX podría quedar en 0 warnings sin tocar lógica financiera ni Web3 de forma accidental.
