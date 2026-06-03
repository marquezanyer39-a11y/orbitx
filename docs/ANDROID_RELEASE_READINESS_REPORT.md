# OrbitX Android Release Readiness

## 1. Resumen ejecutivo

OrbitX esta razonablemente lista para APK interna de QA, pero no esta lista para beta financiera ni lanzamiento publico. La app tiene UI principal avanzada, Perfil/Rango OrbitX funcionales, Web3 real parcial, Send EVM preparado, Browser/Web3 modularizados, lint/test/typecheck limpios y EAS configurado para generar APK interna.

El riesgo real no esta en el build Android sino en producto financiero: Trade sigue en demo, Spot y Cuenta Local siguen controlados/demo, Pool mensual no debe mover dinero real, VIP backend no existe, Backend Ledger real esta en fase de diseno/stubs y OKX/Binance/MEXC no estan conectados. Web3 debe probarse en Android fisico antes de cualquier beta tecnica amplia.

Veredicto: apta para generar APK interna de QA controlada. No apta para beta financiera.

## 2. Porcentaje real por modulo

| Modulo | % real | Estado | Real/Parcial/Mock/Demo | Riesgo | Siguiente paso |
|---|---:|---|---|---|---|
| UI general | 82 | Funcional alto | Parcial | Medio | QA Android visual en 360dp/390dp |
| Home | 76 | Parcial usable alto | Parcial real + filtros demo | Medio | Validar Home balance en APK con wallet real |
| Perfil | 84 | Funcional alto | Real UI + mock metrics | Bajo | QA visual Android |
| Rango OrbitX | 86 | Funcional alto | Logica local + mock VIP | Bajo | Conectar backend VIP futuro |
| Pool mensual | 76 | Visual alto | Mock/controlado | Alto | QA Android + backend ledger antes de dinero real |
| Wallet principal | 72 | Parcial usable | Parcial | Medio | Probar accesos Spot/Web3/Local en APK |
| Web3 Wallet | 73 | Parcial usable | Real parcial | Alto | QA MetaMask/Trust/Coinbase en APK |
| Send EVM | 68 | Parcial usable | Real EVM nativo | Alto | Probar monto minimo y rechazo de firma |
| Browser | 74 | Parcial usable | Real WebView | Medio | QA WebView Android, returnTo y links |
| Astra | 58 | Prototipo avanzado | Parcial | Medio | QA permisos voz/TTS y performance |
| Markets/precios | 72 | Parcial usable | Fuentes publicas + fallback | Medio | Validar degradacion de red/API |
| Trade | 45 | Prototipo avanzado | Demo | Alto | Backend broker real + ordenes auditadas |
| Trading Adapter | 70 | Arquitectura preparada | Mock + adapters futuros | Medio | Conectar solo backend seguro |
| Internal Ledger frontend/mock | 62 | Mock controlado | Mock | Alto | No usar para dinero real |
| Backend Ledger | 36 | Diseno/stubs | Preparado, no operativo | Alto | DB Supabase/Postgres + auth + ACID |
| Spot Wallet | 42 | Demo/controlado | Demo | Alto | Definir provider real o mantener demo |
| Cuenta Local | 38 | Demo/controlado | Demo | Alto | Decidir custodial/no custodial o ocultar |
| Bot Futures | 40 | Bloqueado seguro | Demo/placeholder | Alto | Backend seguro, OAuth/broker auth |
| Crear Token | 60 | Parcial usable | Deploy EVM parcial + pasos config | Alto | QA deploy pequeno y textos de honestidad |
| Social/Gifts | 38 | Mock/prototipo | Mock | Alto | Backend ledger real antes de fondos |
| Rewards | 42 | Mock/controlado | Mock | Alto | Backend ledger/reward reserve |
| VIP backend | 25 | Pendiente | Mock | Medio | Modelo backend + review Gran Duque |
| Seguridad | 74 | Buena para APK interna | Parcial | Alto | Auditoria wallet/Web3 en APK real |
| Performance | 67 | Parcial usable | Parcial | Medio | Refactor Crear Token/Astra/Trade chart |
| Navegacion | 81 | Funcional alto | Real | Medio | QA rutas internas y back stack |
| i18n/textos | 79 | Bueno | Parcial | Bajo | Revision visual manual final |
| Testing | 70 | Base minima | Parcial | Medio | Agregar tests Web3 mockeados y Browser helpers |
| Build readiness | 85 | Alto para QA interna | Real EAS | Medio | Esperar build y probar APK fisica |

## 3. Porcentaje real por tipo de release

| Release | % real | Estado | Bloqueantes |
|---|---:|---|---|
| APK interna | 85 | Lista para build/QA controlado | Esperar finalizacion EAS, QA Android real |
| QA Android | 78 | Lista para iniciar | Falta instalacion fisica y pruebas WalletConnect/WebView/Astra |
| Beta tecnica | 66 | Parcial usable | Web3 Android, Browser, Astra, performance y rutas legacy |
| Beta financiera | 38 | No lista | Trading real, ledger backend, KYC/legal, reconciliacion, provider broker |
| Lanzamiento publico | 29 | No listo | Seguridad financiera, soporte, monitoreo, legal, backend productivo |

## 4. Seguridad pre-build

| Check | Estado | Observacion |
|---|---|---|
| `isRealTradingEnabled` | OK | `false` en `src/constants/featureStatus.ts` |
| `allowOrderPlacement` | OK | `false` en `src/constants/featureStatus.ts` |
| OKX/Binance/MEXC real | OK | Providers deshabilitados y no productivos |
| API secrets frontend | OK | No se encontraron `OKX_SECRET`, `BINANCE_SECRET`, `MEXC_SECRET` ni `apiSecret` reales |
| Bot Futures API Key/Secret | OK | Pantalla bloqueada; muestra backend seguro pendiente |
| WalletConnect core | OK | No modificado en esta fase |
| Seed/private keys | OK | Hallazgos corresponden a wallet/seguridad existentes, no logs ni filtraciones nuevas |
| Web3 vs Ledger | OK | No se conecto ledger mock a Web3 |
| Ledger mock en Home | OK | No alimenta Home |
| Spot demo en Home | OK | `usePortfolioData` excluye Spot si `trade.isDemoMode` |
| Cuenta Local demo en Home | OK | `totalLocalAccount: 0` y no suma cuenta local demo |
| Pool real | OK | Pool sigue controlado/mock, no dinero real |
| Promesas de ganancia | OK | No hay promesas de ganancia garantizada en UI de pool |
| Logs sensibles | OK con nota | Logs encontrados son server/dev o warnings no sensibles |

Busqueda peligrosa ejecutada sobre `src`, `app` y `server` excluyendo `server/node_modules`. No hubo hallazgos criticos que bloqueen build.

## 5. Validacion tecnica

| Comando | Resultado |
|---|---|
| `npm run typecheck` | OK |
| `npm run lint` | OK, 0 errores / 0 warnings |
| `npm test -- --passWithNoTests` | OK, 5 archivos / 18 tests |
| `npx expo-doctor` | OK 18/18 con `NODE_OPTIONS=--use-system-ca` |

Nota: el entorno local requiere `NODE_OPTIONS=--use-system-ca` para evitar fallo de certificado contra Expo API.

## 6. Configuracion Android/EAS

Archivos revisados:
- `package.json`
- `app.config.js`
- `app.json`
- `eas.json`
- `.easignore`
- `.gitignore`
- `plugins/withWalletQueries.js`
- `assets/`

Configuracion detectada:
- Android package: `com.anyer4050.orbitx`
- Scheme: `orbitx`
- Version: `1.0.0`
- Version code EAS remoto: `1`
- Perfil recomendado: `preview`
- Artefacto esperado: APK instalable
- Distribution: `internal`
- Wallet queries plugin: incluye paquetes/schemes para MetaMask, Trust, Coinbase, Rainbow, Uniswap y WalletConnect.
- `.easignore`: excluye `server`, `docs`, logs, dist/build, archivos temporales, APK/AAB locales y `.env`.

Perfiles EAS:
- `development`: APK con dev client.
- `apk`: APK interno.
- `preview`: APK interno.
- `production`: AAB, no recomendado para instalacion directa interna.

Comando correcto para APK interna:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npx eas build --platform android --profile preview --non-interactive --no-wait
```

## 7. Variables criticas

| Variable | Estado local | Estado EAS preview | Impacto |
|---|---|---|---|
| `EXPO_PUBLIC_ORBITX_BACKEND_URL` | Presente | Presente por `eas.json` | Necesaria para Astra/backend |
| `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` | Presente | Presente como sensible en EAS | Necesaria para WalletConnect/Reown |
| `EXPO_PUBLIC_SUPABASE_URL` | Presente local | No listado en EAS preview | Auth live puede caer a modo local/no configurado |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Presente local | No listado en EAS preview | Auth live puede caer a modo local/no configurado |
| `EXPO_PUBLIC_ETHEREUM_RPC_URL` | Ausente local | No verificado en EAS | Puede usar RPC configurados/fallback si existen en registry |
| `EXPO_PUBLIC_BASE_RPC_URL` | Ausente local | No verificado en EAS | Puede usar RPC configurados/fallback si existen en registry |
| `EXPO_PUBLIC_BNB_RPC_URL` | Ausente local | No verificado en EAS | Puede usar RPC configurados/fallback si existen en registry |
| `EXPO_PUBLIC_SOLANA_RPC_URL` | Ausente local | No verificado en EAS | Solana sigue pendiente/parcial |

No se imprimieron secretos. Para APK con auth live, agregar Supabase URL/key al entorno EAS `preview`.

## 8. Resultado build

| Campo | Resultado |
|---|---|
| Ejecutado | Si |
| Comando | `npx eas build --platform android --profile preview --non-interactive --no-wait` |
| Perfil | `preview` |
| Plataforma | Android |
| Distribucion | internal |
| Artefacto esperado | APK |
| Estado al consultar | `in progress` |
| Build ID | `dad82a66-66f7-4b59-9ff1-059cf5f72402` |
| URL logs/build | https://expo.dev/accounts/anyer4050/projects/orbitx/builds/dad82a66-66f7-4b59-9ff1-059cf5f72402 |
| APK generada | Pendiente, `Application Archive URL: <in progress>` al momento de consulta |

Para consultar despues:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npx eas build:view dad82a66-66f7-4b59-9ff1-059cf5f72402
```

## 9. Checklist QA Android

| Area | Accion | Resultado esperado | Estado |
|---|---|---|---|
| Instalacion | Descargar APK desde EAS | Archivo APK disponible | Pendiente |
| Instalacion | Instalar en Android fisico | Android permite instalar desde fuente externa | Pendiente |
| Instalacion | Abrir app | No crashea al inicio | Pendiente |
| Navegacion | Abrir Home, Mercados, Operar, Billetera, Perfil | Tabs funcionan y no aparece tab Ranks | Pendiente |
| Home | Revisar balance | No muestra saldo falso ni suma Spot/Local demo | Pendiente |
| Home | Scroll rapido | Fluido, sin cortes | Pendiente |
| Perfil | Abrir Perfil | Layout compacto, metricas visibles | Pendiente |
| Rango OrbitX | Perfil -> Rango OrbitX -> volver | Abre y vuelve, Perfil sigue activo | Pendiente |
| Rango OrbitX | Revisar rangos | Basic, Plus, Vizconde, Gran Duque visibles | Pendiente |
| Pool mensual | Abrir `/pool` | Diseno premium Stitch visible | Pendiente |
| Pool mensual | Revisar hero/progreso/countdown | Cards compactas y CTA sin tapar safe area | Pendiente |
| Pool mensual | Tocar Participar | No mueve dinero real; flujo controlado | Pendiente |
| Wallet | Abrir Billetera | Carga sin crash | Pendiente |
| Web3 | Entrar a Web3 | Wallet local y externa separadas | Pendiente |
| Web3 | Conectar MetaMask/Trust/Coinbase | Address truncada y red visible | Pendiente |
| Web3 | Actualizar saldo | Loading/error honesto; no saldo hardcodeado | Pendiente |
| Web3 | Cambiar red Ethereum/Base/BNB | Cambia o muestra rechazo/error honesto | Pendiente |
| Send EVM | Probar direccion invalida | Error de direccion | Pendiente |
| Send EVM | Probar monto invalido | Error de monto | Pendiente |
| Send EVM | Rechazar firma | Mensaje de rechazo honesto | Pendiente |
| Send EVM | Enviar monto pequeno controlado | Hash real y explorer si se acepta | Pendiente |
| Browser | Abrir Navegador | WebView sin cuadro negro | Pendiente |
| Browser | Navegar URL y volver | Back/refresh/returnTo funcionan | Pendiente |
| Astra | Abrir Astra | UI carga sin freeze | Pendiente |
| Astra | Probar texto simple | Responde sin pedir seed ni inventar saldos | Pendiente |
| Astra | Probar voz/TTS | Permisos correctos, sin crash | Pendiente |
| Bot Futures | Abrir conexion keys | No permite API Key/API Secret | Pendiente |
| Trade | Abrir Operar | Modo demo/simulacion claro | Pendiente |
| Crear Token | Revisar flujo | No finge deploy si no hay tx/firma real | Pendiente |
| Performance | Navegar rapido 5 minutos | Sin crashes, pantallas negras ni freezes largos | Pendiente |

## 10. Plantilla de bugs

| ID | Pantalla | Accion | Resultado esperado | Resultado real | Prioridad | Captura | Estado |
|---|---|---|---|---|---|---|---|
| BUG-001 |  |  |  |  | Critica/Alta/Media/Baja | Si/No | Pendiente |
| BUG-002 |  |  |  |  | Critica/Alta/Media/Baja | Si/No | Pendiente |
| BUG-003 |  |  |  |  | Critica/Alta/Media/Baja | Si/No | Pendiente |

Prioridades:
- Critica: crash, saldo incorrecto, wallet rota, seguridad.
- Alta: flujo principal roto.
- Media: UI incorrecta, texto roto, scroll malo.
- Baja: detalle visual menor.

## 11. Riesgos pendientes

- WalletConnect en APK real debe probarse con wallets instaladas.
- Web3 real Android puede variar por deep links y provider.
- Send EVM debe probarse solo con monto pequeno controlado.
- Browser WebView puede fallar segun Android/WebView version.
- Astra voz/TTS requiere QA de permisos y performance.
- Trade sigue demo; no ejecutar como real.
- Spot Wallet sigue demo/parcial.
- Cuenta Local sigue demo/parcial.
- Pool interno sigue mock/controlado; no dinero real.
- Backend Ledger esta preparado en schema/stubs, no operativo.
- OKX broker pendiente.
- VIP backend pendiente.
- Crear Token es parcial: revisar deploy real vs pasos de liquidez/airdrop/publicacion.
- KYC/legal/compliance pendientes.
- Supabase EAS preview no aparece configurado; auth live puede no estar activo en APK.

## 12. Que NO hacer todavia

- No conectar OKX real.
- No conectar Binance real.
- No conectar MEXC real.
- No activar trading real.
- No activar pool con dinero real.
- No activar Bot Futures real.
- No usar ledger mock como dinero real.
- No conectar ledger mock al Home.
- No lanzar beta financiera.
- No lanzar publico.

## 13. Siguiente paso recomendado

Esperar a que termine el build EAS `dad82a66-66f7-4b59-9ff1-059cf5f72402`, descargar la APK e iniciar QA Android fisico con el checklist anterior. Antes de una segunda APK, agregar `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` al entorno EAS `preview` si se quiere probar auth live; si no, documentar que la APK de QA usa acceso local/no configurado.
