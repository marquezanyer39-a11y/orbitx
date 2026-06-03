# Implementación Pantalla Pool Mensual — OrbitX

## 0. Archivos de diseño Stitch revisados
- `DESIGN.md`: ✅ — colores encontrados: `#08090B`, `#12131A`, `#151724`, `#14121C`, `#211E28`, `#E6E0EF`, `#CAC3D8`, `#A1A1AA`, `#CCBDFF`, `#6F3FF5`, `#47F3D1`, `#3BA7FF`, `#D4AF37`, `#C0C0C0`, `#CD7F32`, `rgba(255,255,255,0.08)`.
- `code.html`: ✅ — estructura encontrada: header con volver/título/acción, hero card, countdown chip, monto y progreso, card de posición 2x2, estructura de premios 2x2, leaderboard y CTA inferior fijo.
- `screen.png`: ✅ — referencia visual revisada: fondo obsidiana, cards compactas, acentos cyan/turquoise, top 1/2/3 diferenciados y botón inferior azul.

## 1. Resumen ejecutivo
Se actualizó visualmente la pantalla existente `MonthlyRewardsPoolScreen` siguiendo el diseño Stitch "Celestial Obsidian". No se creó una ruta nueva ni se tocó la lógica del pool, store, hook, servicios financieros, Web3, WalletConnect, Home balance, Trading Adapter ni Ledger.

## 2. Decisiones de implementación
- ¿Actualizar o reescribir el render? Se actualizó el render manteniendo `useMonthlyRewardsPool` y el flujo de participación existente.
- ¿Componentes locales o de `src/components/rewardsPool/`? Se actualizaron componentes existentes cuando ya había equivalente y se crearon componentes locales solo para hero/CTA porque la pantalla superaba 350 líneas.
- ¿Qué datos existen en el hook/store? Existen `countdownLabel`, `amountLabel`, `progressLabel`, `snapshot.progressPercent`, `currentUserDisplayRow`, `currentUserDisplayResult`, `snapshot.highlightedRows`, `poolStatus` y `submitParticipation`.
- ¿Qué datos muestran `--`? La card de posición ya muestra `--` desde el componente cuando no hay fila/resultado de usuario.

## 3. Archivos modificados
| Archivo | Tipo de cambio |
|---|---|
| `src/screens/MonthlyRewardsPoolScreen/index.tsx` | Render visual reorganizado, footer fijo, scroll controlado y normalización visual del countdown |
| `src/components/rewardsPool/PoolHeader.tsx` | Header estilo Stitch con volver, título centrado y acción secundaria |
| `src/components/rewardsPool/PoolCountdownPill.tsx` | Chip de tiempo estilo cyan |
| `src/components/rewardsPool/PoolProgressBar.tsx` | Barra de progreso compacta con gradiente cyan/turquoise |
| `src/components/rewardsPool/UserPoolPositionCard.tsx` | Card 2x2 compacta y fiel a Stitch |
| `src/components/rewardsPool/RewardsBreakdown.tsx` | Estructura de premios 2x2 |
| `src/components/rewardsPool/LiveParticipantsList.tsx` | Leaderboard compacto con jerarquía top 1/2/3 |

## 4. Archivos creados
| Archivo | Propósito |
|---|---|
| `src/components/rewardsPool/poolVisualTheme.ts` | Tokens visuales del diseño Stitch |
| `src/screens/MonthlyRewardsPoolScreen/components/PoolHeroCard.tsx` | Hero card extraída para mantener pantalla bajo 350 líneas |
| `src/screens/MonthlyRewardsPoolScreen/components/PoolParticipateButton.tsx` | CTA inferior extraído y reutilizable |
| `docs/POOL_SCREEN_IMPLEMENTATION.md` | Reporte de implementación |

## 5. Estructura visual implementada
- [x] Header con volver + título + acción
- [x] Hero card con progreso y countdown
- [x] Card posición usuario
- [x] Card distribución de premios
- [x] Lista participantes con jerarquía top 3
- [x] CTA Participar sin tapar contenido

## 6. Datos utilizados
| Sección | Fuente de datos | Estado |
|---|---|---|
| Countdown | `useMonthlyRewardsPool().countdownLabel` | Hook existente |
| Pool total/target | `useMonthlyRewardsPool().amountLabel` | Hook existente |
| Progreso | `snapshot.progressPercent` + `progressLabel` | Hook/store existente |
| Posición usuario | `currentUserDisplayRow` / `currentUserDisplayResult` | Hook existente, fallback `--` |
| Leaderboard | `snapshot.highlightedRows` | Store/mock controlado existente del módulo |
| CTA | `poolStatus`, `hasRealParticipation`, `submitParticipation` | Lógica existente sin cambios |

## 7. Seguridad
- [x] Sin OKX ni exchange real
- [x] Sin trading real activado
- [x] Sin Web3 / WalletConnect tocado
- [x] Sin seed / private keys tocados
- [x] Sin Home balance afectado
- [x] Sin Ledger mock conectado al Home
- [x] Sin promesas de ganancia garantizada
- [x] Lógica de pool sin cambios

## 8. UI/UX — Fidelidad al diseño Stitch
- Fondo oscuro premium: ✅
- Cards compactas: ✅
- Acentos cyan/turquoise: ✅
- Jerarquía top 1/2/3 en leaderboard: ✅
- CTA inferior visible y sin tapar: ✅
- Textos en español correcto: ✅

## 9. Validación
| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | 0 errores / 0 warnings |
| `npm test -- --passWithNoTests` | ✅ |
| `npx expo-doctor` | ✅ 18/18 |

## 10. Pendiente para prueba en dispositivo real
- Scroll en pantallas pequeñas
- Safe area inferior del CTA sobre navegación
- Tap en CTA Participar
- Diseño en pantallas Android pequeñas (360dp)
- Leaderboard con lista larga
