# OKX Backend Test Cases — OrbitX

No existe un script backend dedicado (`test:server`, `lint:server` o `typecheck:server`) en esta fase. Estos casos quedan documentados para implementarse cuando el backend tenga runner de tests propio.

## Configuracion

1. `okx-config not_configured`
   - Dado que faltan `OKX_BROKER_CLIENT_ID`, `OKX_BROKER_CLIENT_SECRET` u `OKX_BROKER_CODE`.
   - Esperado: `providerStatus=not_configured`.

2. `production disabled by default`
   - Dado `OKX_ENV=production` y sin `OKX_ALLOW_PRODUCTION=true`.
   - Esperado: `providerStatus=disabled`.

3. `safe config no secrets`
   - Dado config completa.
   - Esperado: `getOkxConfigSafe()` no devuelve `clientSecret`, `webhookSecret` ni tokens completos.

4. `no EXPO_PUBLIC OKX envs`
   - Buscar variables `EXPO_PUBLIC_OKX*`.
   - Esperado: ninguna.

## Errores

5. `provider not configured`
   - Llamar servicio que requiere OKX sin envs.
   - Esperado: `PROVIDER_NOT_CONFIGURED`.

6. `real trading disabled`
   - Llamar `placeOrder` o `createTransfer`.
   - Esperado: `REAL_TRADING_DISABLED`.

7. `metadata sanitization`
   - Crear error con metadata que incluya `token`, `secret`, `authorization`.
   - Esperado: valores `[redacted]`.

## Mappers

8. `map balance`
   - Entrada OKX con `ccy`, `availBal`, `frozenBal`, `eq`.
   - Esperado: tres balances OrbitX `available`, `frozen`, `total`.

9. `map order`
   - Entrada OKX con `ordId`, `instId`, `side`, `ordType`, `state`.
   - Esperado: `TradingOrder` sin payload crudo.

10. `map error`
   - Entrada error desconocido.
   - Esperado: `UNKNOWN_PROVIDER_ERROR` normalizado.

## Endpoints

11. `GET /providers/okx/status`
   - Sin credenciales.
   - Esperado: respuesta segura, sin secrets.

12. `POST /trading/orders sin idempotencyKey`
   - Esperado: error 422 normalizado.

13. `POST /trading/orders con idempotencyKey`
   - Esperado: `REAL_TRADING_DISABLED`.

14. `POST /trading/transfers`
   - Esperado: `REAL_TRADING_DISABLED`.

15. `POST /trading/reconcile`
   - Sin OKX/Ledger real.
   - Esperado: `PROVIDER_NOT_CONFIGURED` o `NOT_IMPLEMENTED`.

## Seguridad

16. `no raw OKX payload`
   - Intentar responder un payload con `data` crudo sin mapper.
   - Esperado: error de proteccion o revision fallida.

17. `logs safe`
   - Revisar que ningun log incluya token, secret, authorization header, API key o client secret.

18. `network disabled`
   - Con envs presentes pero `OKX_ENABLE_NETWORK_REQUESTS=false`.
   - Esperado: `NOT_IMPLEMENTED`; no se ejecuta fetch real.
