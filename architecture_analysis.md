# Análisis de Arquitectura KIRO (OrbitX)

He analizado la base de código de tu proyecto React Native Expo. A continuación, presento un desglose profundo del estado actual de la arquitectura, sus puntos débiles y una propuesta para llevar el ecosistema de KIRO a un nivel de escalabilidad y performance premium.

---

## 1. Arquitectura Actual

El proyecto utiliza **Expo Router** para la navegación, pero mantiene un patrón híbrido donde las rutas en `app/` simplemente re-exportan componentes de `src/screens/` (ej. `app/social/index.tsx` exporta `src/screens/SocialFeedScreen/index`).

El estado global está manejado por **Zustand**, pero se encuentra fuertemente dividido y duplicado:
- Existe un store monolítico masivo en `store/useOrbitStore.ts` de más de 2,100 líneas, que maneja persistencia, perfiles, configuración de UI, y lógica simulada.
- Existe una segunda carpeta `src/store/` con stores modulares (`socialStore.ts`, `authStore.ts`, `walletStore.ts`, etc.).

La estructura de carpetas tiene redundancias significativas, separando responsabilidades de forma poco clara entre el root (`/components`, `/hooks`, `/store`) y la carpeta `/src` (`/src/components`, `/src/hooks`, `/src/store`).

---

## 2. Puntos Débiles

1. **Dualidad de Estructura (`/` vs `/src`)**: Hay componentes, hooks, utils y stores tanto en la raíz del proyecto como dentro de `/src`. Esto genera confusión sobre dónde colocar código nuevo y dificulta el mantenimiento.
2. **Dependencias Web3 Pesadas**: Paquetes como `ethers`, `viem`, `@solana/web3.js` y `solc` compiten en el mismo bundle. En React Native, tener múltiples librerías criptográficas de alto nivel simultáneamente sin una arquitectura de inyección de dependencias impacta drásticamente el tiempo de inicio (TTI).
3. **Monolito de Estado**: `useOrbitStore.ts` hace demasiadas cosas. Al tener persistencia en un store tan masivo, el proceso de rehidratación bloquea o ralentiza el renderizado inicial del layout.
4. **Falta de Límites de Dominio**: El módulo social está entrelazado con la wallet y con configuraciones globales, en lugar de estar empaquetado como un feature independiente.

---

## 3. Problemas de Escalabilidad

- **Carga Cognitiva**: Para agregar una nueva pantalla, un desarrollador tiene que tocar `app/ruta.tsx`, `src/screens/RutaScreen/`, y posiblemente agregar estado en `useOrbitStore.ts` y en `src/store/rutaStore.ts`.
- **Persistencia en Zustand**: Persistir objetos muy grandes (como el historial completo de actividad, feed, o datos on-chain) en un solo store de AsyncStorage degradará el rendimiento al escalar el uso de la app.
- **Preparación para el Backend**: Gran parte de la lógica actual simula datos en el frontend (`utils/simulate.ts`). La arquitectura actual no expone una capa de "servicios" o "repositorios" clara que permita cambiar fácilmente la simulación por llamadas reales a una API (GraphQL/REST/tRPC).

---

## 4. Riesgos de Performance

- **Re-renders Globales**: Al tener un store gigante (`useOrbitStore`), cualquier actualización mínima (ej. `toggleOrbitMotion`) puede causar re-renders en componentes que estén subscritos al estado general, a menos que se usen selectores atómicos de manera estricta y perfecta (lo cual es muy difícil de mantener).
- **Sobrecarga del Root Layout**: El archivo `app/_layout.tsx` (437 líneas) maneja lógica de autenticación, hidratación, verificación biométrica, deep linking, y define todas las pantallas. Esto retrasa la aparición de la primera pantalla útil.
- **Polyfills y Web3**: La integración de polyfills para librerías criptográficas de Node en Expo (Crypto, Buffer, Streams) puede causar cuellos de botella en el hilo de JavaScript (JS Thread), afectando las animaciones a 60fps.

---

## 5. Inconsistencias de Diseño (Theme)

- **Configuración Híbrida**: El theme en `constants/theme.ts` está muy bien estructurado (Night, Day, Orbit), pero está acoplado con el estado global de zustand y dependiente de lógica inline.
- **Transparencias Dinámicas**: La función `withOpacity` utiliza Regex en tiempo real para modificar colores. Al escalar, ejecutar esto durante el renderizado puede afectar el frame rate. Estos valores deberían calcularse de antemano o usar tokens CSS nativos (ej. Tailwind/NativeWind) o variables en tiempo de diseño.

---

## 6. Problemas de Navegación

- **Re-exportación Innecesaria**: Expo Router está diseñado para que los componentes de las pantallas vivan directamente en la carpeta `app/`. Al usar `app/` solo para enrutamiento (como `export { default } from...`) y mantener la UI en `src/screens`, se está luchando contra el paradigma del framework.
- **Falta de Grupos Lógicos**: `app/_layout.tsx` enumera docenas de modales y pantallas en un solo `Stack`. Expo Router permite usar grupos `(social)`, `(auth)`, `(wallet)` para separar modales, layouts secundarios y dependencias.

---

## 7. Código Duplicado

- Carpetas espejo: `components/` vs `src/components/`, `hooks/` vs `src/hooks/`, `store/` vs `src/store/`, `utils/` vs `src/utils/`.
- Tiendas híbridas: Lógica de autenticación repartida entre `utils/orbitAuth.ts`, `useOrbitStore.ts` y `src/store/authStore.ts`.

---

## 8. Problemas Potenciales en el Módulo Social

- **Complejidad de Datos en Tiempo Real**: El módulo social actual parece depender de stores estáticos de zustand. Para feeds, live streams y mensajería, esto no escalará. Se necesita caché optimística (ej. React Query / SWR) y no un store global síncrono.
- **Rendimiento de Listas**: Un Feed social requiere componentes tipo `FlashList` (de Shopify) y manejo de paginación infinita, lo cual no es manejable eficientemente con un estado monolítico de zustand.

---
---

# Propuesta de Solución Arquitectónica (KIRO Social & Core)

Para lograr una aplicación premium, escalable, y preparada para una red social + Web3, debemos implementar una **Arquitectura basada en Dominios (Feature-Sliced Design simplificado)** adaptada para Expo Router.

## Estructura Ideal de Carpetas

Centralizamos todo dentro de `src/` (dejando `app/` exclusivamente para el file-system routing de Expo) y dividimos por dominios.

```text
kiro-app/
├── app/                        # Expo Router (File-based Routing)
│   ├── (auth)/                 # Grupo: Autenticación
│   ├── (tabs)/                 # Grupo: Tab Bar (Home, Social, Wallet)
│   ├── (social)/               # Grupo: Vistas del dominio Social
│   └── _layout.tsx             # Layout muy ligero, solo Providers
├── src/
│   ├── core/                   # El "motor" de la app
│   │   ├── theme/              # Tokens de diseño pre-calculados (sin regex en runtime)
│   │   ├── i18n/               # Internacionalización
│   │   ├── navigation/         # Tipos y utilidades de navegación
│   │   └── storage/            # MMKV (para persistencia ultra rápida, reemplazando AsyncStorage)
│   ├── shared/                 # UI Kit Reutilizable
│   │   ├── components/         # Botones, Inputs, Cards, Loaders, Toasts
│   │   ├── hooks/              # Hooks genéricos
│   │   └── utils/              # Formateo, matemáticas
│   ├── modules/                # DOMINIOS DE NEGOCIO AISLADOS
│   │   ├── social/             # ❤️ DOMINIO SOCIAL
│   │   │   ├── components/     # UI específica (PostCard, CommentTree, LiveBadge)
│   │   │   ├── screens/        # Contenido inyectado a las rutas de `app/(social)`
│   │   │   ├── store/          # Store de Zustand SOLO para estado efímero del reproductor o UI
│   │   │   └── api/            # Configuración de React Query / Mutaciones para Backend
│   │   ├── wallet/             # 💳 DOMINIO WALLET / WEB3
│   │   ├── astra/              # 🤖 DOMINIO IA
│   │   └── creator/            # 🎨 DOMINIO ECONOMÍA DE CREADORES
└── package.json
```

---

## Arquitectura Ideal para KIRO Social

1. **Gestión de Datos por Caché (React Query)**:
   Reemplazar Zustand por `@tanstack/react-query` para la data del Feed, Perfiles y Comentarios. Esto soluciona la paginación, el re-fetching en background, el caché optimista (dar "like" al instante sin esperar al backend) y evita re-renders innecesarios.
2. **Estado Efímero (Zustand Modular)**:
   Zustand solo debe existir dentro de `src/modules/social/store/` para cosas locales: *¿Está el teclado abierto? ¿Qué post está actualmente pausado/reproduciendo un video?*
3. **Listas de Alto Rendimiento**:
   Migrar forzosamente a `@shopify/flash-list` para el timeline, lo que garantiza 60FPS fluidos incluso con miles de posts con imágenes/videos.

---

## Sistemas Reutilizables (UI Kit)

Crear un sistema de diseño inquebrantable en `src/shared/components`:
- `KiroText`, `KiroButton`, `KiroAvatar`, `KiroCard`.
- **Variantes de Tema sin Cálculo Funcional**: Pre-computar el tema en el arranque en vez de usar `withOpacity()` en tiempo de render.

---

## Estrategia de Escalabilidad y Preparación (Future-Proofing)

### 1. Preparación para Backend Futuro
Implementaremos el Patrón de Repositorio. El UI no debe saber si la data viene de `utils/simulate.ts` o de Supabase/GraphQL.
```typescript
// src/modules/social/api/feedService.ts
export const FeedService = {
  getPosts: async (page: number) => {
    // Actualmente: return simulatePosts(page)
    // Futuro: return apiClient.get('/v1/feed?page=' + page)
  }
}
```

### 2. Preparación para Live Streaming
El Live Streaming requerirá WebRTC o HLS. Crearemos un componente "Dummy" `LiveStreamView` que por ahora muestre UI estática (chat, contador de viewers, botones de donación), pero que esté encapsulado para poder enchufar el SDK de AWS IVS, Mux o Agora en el futuro sin reescribir la UI de la pantalla social.

### 3. Preparación para Creator Economy
El módulo de Creadores debe conectarse con el módulo Wallet de forma desacoplada.
Crearemos interfaces abstractas: ej. `handleTipCreator(creatorId, amount, token)`. Hoy esto será visual; mañana ejecutará una transacción en la blockchain base con `viem`.

### 4. Preparación para Astra AI
Astra AI (el agente/bot) necesitará escuchar el contexto de navegación. Se debe diseñar un store ligero `astraUIStore` que Astra pueda leer para saber "En qué pantalla está el usuario" y así dar sugerencias contextuales, sin tener que conectar a Astra al store masivo de toda la app.

### 5. Integración Opcional con X (Twitter)
El login o importación de perfil desde X requiere que la interfaz de "User Profile" sea agnóstica de la fuente. Crearemos un modelo universal `KiroProfile` que mapeará los campos tanto de un usuario nativo como de uno traído por la API de X.

---

**Resumen del plan de acción propuesto:**
1. Unificar las carpetas (Eliminar la redundancia root vs `/src`).
2. Romper el store gigante en pequeños stores efímeros.
3. Limpiar `app/_layout.tsx` delegando la carga a componentes menores.
4. Diseñar los dominios modulares (`social`, `wallet`, `astra`).

Quedo a la espera de tus comentarios. Cuando estés listo, podemos proceder a planificar la implementación de estos cambios paso a paso.
