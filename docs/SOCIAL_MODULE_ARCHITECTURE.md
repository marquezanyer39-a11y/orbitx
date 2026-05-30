# Social Module Architecture — OrbitX

## Objetivo
Definir una base escalable para el módulo social de OrbitX sin conectar backend real, sockets, pagos, streaming real ni integración real con X.

## Principios
- `OrbitX` es social-first y no depende de X para funcionar.
- `X` es un puente opcional de distribución y crecimiento.
- La capa actual de UI social puede seguir evolucionando mientras la nueva capa `src/social/` centraliza contratos, mocks y organización.
- Los módulos deben crecer por dominio, no por pantallas gigantes.

## Estructura objetivo
```text
src/social/
  animations/
    socialMotion.ts
  components/
    badges/
    cards/
    comments/
    core/
    creator-economy/
    feed/
    live/
    overlays/
    profile/
    index.ts
  hooks/
    useSocialArchitecture.ts
    index.ts
  mocks/
    creators.ts
    feed.ts
    comments.ts
    streams.ts
    economy.ts
    index.ts
  navigation/
    socialRoutes.ts
  screens/
    comments/
    create/
    discovery/
    feed/
    gifts/
    live/
    notifications/
    profile/
    settings/
    shared/
    wallet/
    index.ts
  services/
    contracts/
      socialContracts.ts
    mocks/
      socialMockGateway.ts
  store/
    socialUiStore.ts
  theme/
    socialTheme.ts
  types/
    domain.ts
    ui.ts
    index.ts
  index.ts
```

## Capas
### 1. Social Core
- Feed
- Posts
- Comments
- Profiles
- Follows

### 2. Live System
- Live room
- Chat overlay
- Floating reactions
- Gifts

### 3. Creator Economy
- Supporters
- Earnings
- Gifts catalog
- Social wallet

### 4. Astra AI
- Feed insights
- Live insights
- Profile insights
- Comment sentiment

### 5. X Integration
- Solo ruta de configuración y contrato
- OAuth futuro solo desde backend
- Import/export opcional

## Pantallas base
- `SocialHomeFeedScreen`
- `SocialLiveRoomScreen`
- `SocialCreatorProfileScreen`
- `SocialCommentsOverlayScreen`
- `CreatePostScreen`
- `StreamDiscoveryScreen`
- `SocialNotificationsScreen`
- `GiftStoreScreen`
- `SocialWalletScreen`
- `XConnectionSettingsScreen`

## Componentes reutilizables
- `SocialHeader`
- `SocialTabs`
- `SocialBottomNav`
- `FeedItem`
- `LiveVideoOverlay`
- `LiveChatOverlay`
- `FloatingReactions`
- `AstraInsightOverlay`
- `CommentItem`
- `CreatorBadge`
- `VIPBadge`
- `GiftAnimation`
- `StreamCard`
- `CreatorStats`
- `ProfileHeader`
- `CreatorEarningsStrip`

## Servicios
Por ahora solo existen contratos + mock gateway:
- `SocialFeedServiceContract`
- `SocialLiveServiceContract`
- `SocialEconomyServiceContract`
- `SocialExternalAccountServiceContract`
- `SocialNotificationsServiceContract`

## Stores
- `src/store/socialStore.ts`: estado mock funcional actual.
- `src/social/store/socialUiStore.ts`: estado efímero de overlays y navegación social.

## Estrategia de migración
1. Mantener funcionando las pantallas actuales.
2. Usar `src/social/screens/*` como arquitectura objetivo.
3. Reexportar las pantallas ya implementadas para evitar refactors agresivos.
4. Mover gradualmente lógica y mocks hacia `src/social/`.
5. Conectar backend social después, detrás de contratos claros.

## No activado
- Backend real
- Streaming real
- WebSockets reales
- Gifts reales
- Pagos reales
- OAuth real con X
- Import/export real con X
