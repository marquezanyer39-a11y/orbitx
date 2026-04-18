# Pool de Recompensas por Participación

## Cálculo de ranking y distribución

- `aporte_real_usd` se obtiene convirtiendo el activo elegido a centavos USD con tasa vigente al momento de la entrada.
- `aporte_ranking_usd = min(aporte_real_usd, 10 USD)`.
- El ranking se ordena por:
  1. `aporte_ranking_usd` descendente
  2. `timestamp` ascendente
- `house_fee = total_pool * 10%`
- `distributable_pool = total_pool - house_fee`
- `top4_pool = distributable_pool * 50%`
- `variable_pool = distributable_pool - top4_pool`
- Reparto top 4:
  - rank 1 = 60% de `top4_pool`
  - rank 2 = 24% de `top4_pool`
  - rank 3 = 12% de `top4_pool`
  - rank 4 = 4% de `top4_pool`
- Reparto proporcional:
  - `participation_share = aporte_real_usd / suma_total_aportes_reales_usd`
  - `variable_reward = participation_share * variable_pool`
- `total_reward = variable_reward + rank_reward`

## Control de redondeos

- Todo el cálculo monetario se hace en centavos USD enteros.
- La conversión asset -> USD usa aritmética fija con `BigInt`.
- La distribución usa asignación por restos mayores para:
  - top 4
  - reparto proporcional
- Esto garantiza que:
  - nunca haya valores negativos
  - no se pierdan centavos
  - `sum(total_reward) == distributable_pool`

## Garantía de una sola participación

- El store del pool bloquea cualquier nueva participación si el usuario ya tiene una entrada:
  - `pending`
  - `confirmed`
- Si una participación falla antes de confirmarse, no cuenta para el pool y el usuario puede reintentar.

## Cómo se asegura la suma exacta de payouts

- Primero se calcula `distributable_pool`.
- Luego se divide el pool en:
  - `top4_pool`
  - `variable_pool`
- Cada subpool se reparte con pesos exactos y asignación por restos mayores.
- Los centavos remanentes se asignan determinísticamente por orden de mayor residuo.

## Microajustes visuales realizados

- Fondo oscuro naval premium con acentos cian/turquesa y morado mínimo.
- Barra de progreso y CTA con brillo controlado solo en elementos clave.
- Tarjeta elevada de usuario con borde dorado suave.
- Ranking con jerarquía metálica para top 1, 2, 3 y 4.
- Header limpio con `Pool mensual` + `Astra`.
- Bottom sheet único integrado, sin navegación adicional ni selectors aparte.
