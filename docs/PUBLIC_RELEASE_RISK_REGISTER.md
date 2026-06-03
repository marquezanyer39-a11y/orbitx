# OrbitX Public Release Risk Register

| ID | Riesgo | Area | Probabilidad | Impacto | Severidad | Mitigacion | Estado |
|---|---|---|---|---|---|---|---|
| R-001 | Trading real activado sin aprobacion broker/legal | Trading/Broker | Baja | Critico | Critica | Mantener `isRealTradingEnabled=false`, `OKX_REAL_TRADING_ENABLED=false`, approval formal y gates. | Controlado por flags |
| R-002 | Ledger mock confundido con dinero real | Ledger/Product | Media | Alto | Alta | Etiquetas demo, no conectar mock al Home, QA copy. | Parcial |
| R-003 | Pool usado como producto financiero real antes de backend | Pool/Legal | Media | Critico | Critica | Mantener mock/controlado, sin promesas, ledger real antes de dinero. | Parcial |
| R-004 | WalletConnect falla en APK | Web3 | Media | Alto | Alta | QA con MetaMask/Trust/Coinbase en APK real. | Pendiente QA |
| R-005 | Send EVM envia en red incorrecta o con error no claro | Web3/Send | Media | Alto | Alta | QA rechazo, chain mismatch, explorer, montos pequeños. | Pendiente QA |
| R-006 | Browser WebView queda negro o bloqueado | Browser | Media | Medio | Media | QA Android real, fallback error state, pruebas URLs. | Pendiente QA |
| R-007 | Astra consume demasiados recursos o falla permisos | Astra/Performance | Media | Medio | Media | QA voz/TTS/STT, background/foreground, low-end Android. | Pendiente QA |
| R-008 | Supabase no configurado en EAS preview | Auth/Release | Media | Alto | Alta | Verificar variables EAS y flujo login/reset en APK. | Pendiente |
| R-009 | Falta KYC/legal antes de beta financiera | Legal/Compliance | Alta | Critico | Critica | Definir jurisdicciones, KYC/AML, terminos, disclosures. | Bloqueante |
| R-010 | Falta monitoreo y alertas | Ops | Alta | Alto | Alta | Agregar observabilidad antes de beta financiera. | Pendiente |
| R-011 | Falta soporte operativo | Ops/Product | Alta | Medio | Alta | Crear soporte, FAQ, runbooks y escalamiento. | Pendiente |
| R-012 | Falta reconciliacion real | Ledger/Finance | Alta | Critico | Critica | Implementar provider reconciliation con DB y manual review. | Pendiente |
| R-013 | Secrets mal configurados en backend/EAS | Security/Ops | Media | Critico | Critica | Secret scan, env policy, no `EXPO_PUBLIC` para secrets. | Parcial |
| R-014 | Usuarios confundidos por demos | UX/Product | Alta | Alto | Alta | Etiquetas demo/simulacion visibles y disclaimers. | Parcial |
| R-015 | Archivos grandes causan regresiones al tocarse | Architecture | Media | Medio | Media | Refactor incremental, tests, evitar cambios masivos. | Parcial |
| R-016 | Crear Token parcial se interpreta como deploy completo | Create Token | Media | Alto | Alta | Copy honesto, hash real solo si existe transaccion. | Parcial |
| R-017 | Spot Wallet demo se interpreta como saldo real | Wallet/Spot | Media | Alto | Alta | No sumar al Home, etiquetas demo, bloquear acciones reales. | Parcial |
| R-018 | Cuenta Local demo se interpreta como cuenta custodial real | Wallet/Local | Media | Alto | Alta | Etiquetas demo, no depositos/retiros, no Home real. | Parcial |
| R-019 | OKX provider stubs se confunden con integracion real | Backend/Partner | Baja | Alto | Media | Reportes y docs indican stubs; respuestas `PROVIDER_NOT_CONFIGURED`. | Controlado |
| R-020 | Idempotencia no persistente genera duplicados futuros | Backend/Finance | Alta | Critico | Critica | Implementar `idempotency_keys` antes de POST financiero real. | Pendiente |
| R-021 | Auth/RBAC incompleto expone endpoints financieros | Backend/Security | Media | Critico | Critica | Mantener endpoints cerrados hasta auth real + RBAC. | Parcial |
| R-022 | Tokens provider sin cifrar en implementacion futura | Security/OKX | Media | Critico | Critica | Usar KMS/secret rotation y `provider_oauth_tokens` cifrado. | Pendiente |
| R-023 | No hay backend tests dedicados | QA/Backend | Alta | Medio | Alta | Agregar scripts server y tests de stubs/schema. | Pendiente |
| R-024 | Expo/EAS env drift entre local y preview | Release | Media | Medio | Media | Documentar envs por perfil y smoke test post-build. | Parcial |
| R-025 | Logs sensibles por accidente | Security/Ops | Media | Alto | Alta | Sanitizar logger, secret scan, no balances/addresses completos. | Parcial |
| R-026 | Falta auditoria externa antes de publico | Security/Compliance | Alta | Critico | Critica | Auditoria financiera/Web3/backend antes de launch. | Pendiente |
| R-027 | Performance baja en Android economico | Performance | Media | Medio | Media | QA low-end, perf profiling, dividir pantallas grandes. | Pendiente QA |
| R-028 | Falta politica de retiros y disputas | Legal/Finance | Alta | Critico | Critica | Definir antes de withdrawals o beta financiera. | Bloqueante |
| R-029 | Riesgo de promesa de rentabilidad en rewards/pool | Legal/Product | Media | Alto | Alta | Revisar copy legal, no APY garantizado, disclaimers. | Parcial |
| R-030 | Dependencia de APIs publicas de mercado con rate limits | Markets | Media | Medio | Media | Cache, fallback honesto, provider backend futuro. | Parcial |

## Riesgos mas urgentes

1. KYC/legal/compliance pendiente.
2. Ledger backend real no operativo.
3. Auth/RBAC/idempotencia persistente no productivos.
4. QA Android real con WalletConnect/WebView/Send EVM pendiente.
5. Demos financieros pueden confundirse con dinero real si el copy no se mantiene estricto.
