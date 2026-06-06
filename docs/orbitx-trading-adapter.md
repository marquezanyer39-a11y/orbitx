# OrbitX Trading Adapter Layer

## Que es

Trading Adapter Layer es la capa que separa la app OrbitX de cualquier proveedor externo de trading. La app movil consume modelos internos OrbitX y nunca modelos crudos de OKX, Binance, MEXC, Bybit u otro proveedor.

## Por que existe

Sin esta capa, cambiar de proveedor obliga a rehacer pantallas, stores y reglas de UI. Con esta capa, la app llama a `tradingService`, el servicio elige un adapter y el adapter traduce entre OrbitX y el proveedor.

## OKX como proveedor actual preparado

El adapter OKX esta preparado para hablar solo con OrbitX Backend:

- `GET /trading/provider/status`
- `GET /trading/provider/capabilities`
- `GET /trading/account/status`
- `GET /trading/instruments`
- `GET /trading/ticker?symbol=BTC-USDT`
- `GET /trading/orderbook?symbol=BTC-USDT`
- `GET /trading/balances`
- `GET /trading/orders/open`
- `GET /trading/orders/history`
- `GET /trading/trades/history`
- `GET /trading/positions`
- `GET /trading/fees`
- `POST /trading/orders`
- `DELETE /trading/orders/:id`
- `POST /trading/transfers`

El frontend no contiene API secrets, no firma requests privadas y no llama a OKX directamente.

## Como agregar Binance, MEXC o Bybit

Cada proveedor debe implementar `ITradingAdapter`. El adapter futuro puede mantener la misma firma de metodos y traducir modelos internos OrbitX hacia el backend que firme y ejecute con el proveedor correspondiente.

## Como cambiar a motor propio

Cuando OrbitX tenga matching engine propio, se reemplaza `orbitxEngineAdapter` y su backend. Las pantallas siguen llamando a `tradingService`, por lo que el cambio no requiere rehacer la UI.

## Frontend vs backend

Frontend:

- modelos internos OrbitX
- lectura de estados seguros
- llamadas al backend OrbitX
- mensajes demo/honestos

Backend:

- API secrets
- firma privada de requests
- broker code/tag
- subcuentas
- ordenes reales
- reconciliacion financiera
- auditoria y logs

## Mapeo

Ordenes, balances, trades, posiciones, fees y transfers deben mapearse desde el proveedor hacia:

- `TradingOrder`
- `TradingBalance`
- `TradingTrade`
- `TradingPosition`
- `TradingFee`
- `TradingTransfer`

La app no debe depender de nombres ni formatos del proveedor.
