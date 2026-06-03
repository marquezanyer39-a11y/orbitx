# Seguridad Bot Futures

## Estado actual

Bot Futures queda bloqueado para conexiones reales con exchanges mientras OrbitX no tenga backend seguro aprobado. La app móvil ya no debe capturar, guardar ni enviar API Key, API Secret o passphrase privadas desde formularios del frontend.

## Regla principal

Las API secrets nunca deben vivir en la app móvil. Tampoco deben guardarse en AsyncStorage, SecureStore ni en stores locales de Zustand. El frontend solo puede mostrar estado, iniciar un flujo seguro y recibir estados no sensibles desde backend.

## Flujo futuro permitido

- OrbitX Backend debe custodiar cualquier integración privada con OKX, Binance, MEXC u otro broker.
- La app móvil debe iniciar autorización OAuth, broker authorization o un flujo firmado por backend.
- Las órdenes del bot deben enviarse al backend OrbitX y el backend debe validar permisos, límites, idempotencia, auditoría y riesgo.
- La firma de requests privadas del exchange debe ocurrir únicamente en backend seguro.
- La app móvil nunca debe firmar requests privadas de exchanges ni exponer secretos.

## Estado operativo

- Entrada de API Secret en frontend: bloqueada.
- Persistencia local de secrets: bloqueada.
- Trading real de bots: bloqueado.
- Backend seguro: pendiente.
- Integración OKX/Binance/MEXC real: no conectada.

## Checklist antes de activar

- Backend con almacenamiento cifrado y rotación de credenciales.
- KMS o vault para secretos.
- Auditoría completa de órdenes y cambios de configuración.
- Idempotency keys para órdenes y movimientos financieros.
- Límites de riesgo por usuario, símbolo, exchange y estrategia.
- Revisión legal/compliance y aprobación del proveedor broker.
