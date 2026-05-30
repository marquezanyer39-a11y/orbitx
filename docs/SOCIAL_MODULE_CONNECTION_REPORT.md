# Social Module Connection Report — OrbitX

## Resumen

Se consolidó la arquitectura interna del módulo social sin cambiar la identidad visual existente y sin conectar backend real, X real, pagos, streaming real ni sockets.

## Capas conectadas

- `src/social/types/`
  - tipos centrales reutilizables para social, live, creator, gifts, Astra y cuentas externas
- `src/social/mocks/`
  - datos mock centralizados para creators, posts, streams, comments, gifts y Astra
- `src/social/services/`
  - servicios mock asíncronos con delay y contratos de reemplazo futuro
- `src/social/hooks/`
  - hooks de orquestación para feed, live, profile, comments, gifts y Astra
- `src/social/stores/`
  - estado UI/orquestación con Zustand para social general, live y creator profile
- `src/social/overlays/`
  - overlays compartidos: comments, share, gifts y Astra insight
- `src/social/navigation/`
  - rutas y helper de navegación social

## Pantallas conectadas

- `SocialFeedScreen`
  - usa `useSocialFeed`
  - usa `CommentsBottomSheet`, `ShareModal`, `AstraInsightSheet`
  - navega a creator, create post, discovery y notifications

- `LiveRoomScreen`
  - usa `useLiveRoom`
  - usa `CommentsBottomSheet`, `GiftSheet`, `ShareModal`, `AstraInsightSheet`
  - usa reacciones flotantes y gift burst desde store live

- `SocialProfileScreen`
  - usa `useSocialProfile`
  - usa `ShareModal` y `AstraInsightSheet`
  - soporta navegación a inbox y rutas sociales

- `SocialCreateScreen`
  - usa `useSocialFeed`
  - usa categorías centralizadas desde mocks sociales

- `StreamDiscoveryScreen`
  - usa mocks centralizados de live discovery
  - navega a `LiveRoom`

## Rutas sociales preparadas

- `/social`
- `/social/live`
- `/social/profile`
- `/social/creator/[creatorId]`
- `/social/comments/[postId]`
- `/social/create`
- `/social/discovery`
- `/social/notifications`
- `/social/gifts`
- `/social/wallet`
- `/social/settings/x`

## Guards y TODOs futuros

- `canComment`
- `canSendGift`
- `canStartLive`
- `canShareToX`
- `requiresXConnection`
- `isCreatorVerified`

Pendientes explícitos:

- TODO backend social real
- TODO WebSocket/chat real
- TODO provider de live real
- TODO gifts reales / wallet ledger
- TODO X OAuth opcional

## Validación

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm test -- --passWithNoTests` ✅
- `npx expo-doctor` ⚠️ 17/18 por patch mismatches preexistentes del SDK Expo
