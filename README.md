# OrbitX

MVP mobile crypto super app en modo simulado, construido con Expo + React Native + TypeScript.

## Stack

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- AsyncStorage
- Reanimated

## Incluye

- Home con balance, ganancias diarias y accesos rapidos
- Wallet con activos, modo custodial / non-custodial y acciones de fondos
- Market con precios mock en tiempo real y flujo de compra / venta
- Launchpad para crear memecoins y listarlas al instante
- Bot automatico simulado con historial y configuracion simple
- Feed social con comentarios y reacciones
- Persistencia local de balances, tokens creados, bot y feed

## Estructura

```text
app/
  (tabs)/
components/
  cards/
  common/
  forms/
  lists/
  modals/
constants/
hooks/
mocks/
store/
types/
utils/
```

## Ejecutar

```bash
npm install
npm run start
```

## Auth real por correo

OrbitX ya puede conectarse a Supabase Auth para registro, login, recuperacion y sesion persistente.

1. Crea un archivo `.env` usando `.env.example`
2. Completa:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu-publishable-key
```

3. En Supabase Auth agrega este redirect URL para recuperacion:

```text
orbitx://auth/reset
```

## Verificacion

```bash
npm run typecheck
npx expo export --platform web
```

## Escalado futuro

- reemplazar mocks por API / backend real
- conectar wallet real y custodias
- mover bot a servicio server-side
- añadir autenticacion, onboarding y KYC
- integrar blockchain real para trading y launchpad
