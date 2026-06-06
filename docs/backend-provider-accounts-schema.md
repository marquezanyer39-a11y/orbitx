# Backend Provider Accounts Schema - OrbitX

Este documento define el schema PostgreSQL/Supabase necesario para vincular usuarios OrbitX con proveedores broker como OKX, manejar OAuth tokens cifrados, idempotencia persistente, roles backend, audit logs y jobs de reconciliacion.

Estado: preparado, no productivo. No conecta OKX real, no activa trading real y no mueve dinero.

## Principios

- Los secrets y tokens viven solo en backend.
- Ningun token se guarda sin cifrar.
- El frontend nunca recibe access tokens, refresh tokens ni provider secrets.
- Todo POST financiero requiere `idempotencyKey`.
- La misma `idempotencyKey` devuelve el resultado original.
- La misma `idempotencyKey` con payload distinto devuelve `IDEMPOTENCY_CONFLICT`.
- Endpoints admin requieren RBAC.
- Reconciliacion no hace auto-ajustes.
- Audit log no se edita ni se borra.

## SQL base

```sql
create extension if not exists pgcrypto;

create table if not exists provider_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider_id text not null,
  provider_user_id text null,
  provider_account_id text null,
  provider_subaccount_id text null,
  status text not null,
  permissions jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_accounts_status_check
    check (status in ('pending', 'connected', 'disconnected', 'suspended', 'error')),
  constraint provider_accounts_provider_id_check
    check (provider_id = lower(provider_id) and provider_id ~ '^[a-z0-9_-]{2,32}$'),
  constraint provider_accounts_unique_user_provider
    unique (user_id, provider_id)
);

create index if not exists provider_accounts_user_provider_idx
  on provider_accounts (user_id, provider_id);

create index if not exists provider_accounts_provider_status_idx
  on provider_accounts (provider_id, status);

create table if not exists provider_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  provider_account_id uuid not null references provider_accounts(id),
  access_token_encrypted text null,
  refresh_token_encrypted text null,
  expires_at timestamptz null,
  scopes text[] not null default '{}',
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_oauth_tokens_status_check
    check (status in ('active', 'expired', 'revoked', 'error')),
  constraint provider_oauth_tokens_unique_account
    unique (provider_account_id)
);

create index if not exists provider_oauth_tokens_account_status_idx
  on provider_oauth_tokens (provider_account_id, status);

create table if not exists idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  user_id uuid null,
  operation_type text not null,
  request_hash text null,
  response_snapshot jsonb null,
  status text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  constraint idempotency_keys_status_check
    check (status in ('processing', 'completed', 'failed')),
  constraint idempotency_keys_key_check
    check (key ~ '^[A-Za-z0-9:_-]{12,160}$')
);

create index if not exists idempotency_keys_user_operation_idx
  on idempotency_keys (user_id, operation_type, created_at);

create index if not exists idempotency_keys_expires_idx
  on idempotency_keys (expires_at);

create table if not exists backend_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid null,
  actor_role text null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  before jsonb null,
  after jsonb null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text null,
  user_agent text null,
  created_at timestamptz not null default now()
);

create index if not exists backend_audit_logs_actor_idx
  on backend_audit_logs (actor_id, created_at);

create index if not exists backend_audit_logs_entity_idx
  on backend_audit_logs (entity_type, entity_id, created_at);

create table if not exists backend_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null,
  status text not null,
  created_at timestamptz not null default now(),
  constraint backend_roles_role_check
    check (role in ('user', 'admin', 'compliance', 'finance', 'support', 'developer_readonly')),
  constraint backend_roles_status_check
    check (status in ('active', 'suspended', 'revoked')),
  constraint backend_roles_unique_user_role
    unique (user_id, role)
);

create index if not exists backend_roles_user_status_idx
  on backend_roles (user_id, status);

create table if not exists provider_reconciliation_jobs (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  asset text not null,
  status text not null,
  internal_total_decimal numeric(28,8) null,
  provider_total_decimal numeric(28,8) null,
  difference_decimal numeric(28,8) null,
  severity text null,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  reviewed_by uuid null,
  constraint provider_reconciliation_jobs_status_check
    check (status in ('pending', 'running', 'completed', 'failed', 'reviewed')),
  constraint provider_reconciliation_jobs_severity_check
    check (severity is null or severity in ('ok', 'warning', 'critical')),
  constraint provider_reconciliation_jobs_provider_id_check
    check (provider_id = lower(provider_id) and provider_id ~ '^[a-z0-9_-]{2,32}$'),
  constraint provider_reconciliation_jobs_asset_check
    check (asset = upper(asset) and asset ~ '^[A-Z0-9]{2,16}$')
);

create index if not exists provider_reconciliation_jobs_provider_asset_idx
  on provider_reconciliation_jobs (provider_id, asset, created_at);

create index if not exists provider_reconciliation_jobs_status_idx
  on provider_reconciliation_jobs (status, severity, created_at);
```

## Triggers recomendados

```sql
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger provider_accounts_set_updated_at
before update on provider_accounts
for each row execute function set_updated_at();

create trigger provider_oauth_tokens_set_updated_at
before update on provider_oauth_tokens
for each row execute function set_updated_at();
```

## Protecciones recomendadas

```sql
create or replace function block_delete()
returns trigger as $$
begin
  raise exception 'Delete bloqueado para tabla financiera/auditable';
end;
$$ language plpgsql;

create trigger backend_audit_logs_no_delete
before delete on backend_audit_logs
for each row execute function block_delete();

create trigger idempotency_keys_no_delete
before delete on idempotency_keys
for each row execute function block_delete();
```

## Reglas de negocio

### Provider accounts

- `provider_user_id` no debe venir del frontend.
- `provider_user_id` debe originarse en OAuth/callback backend.
- `permissions` debe ser normalizado por backend.
- `metadata` no debe incluir raw payloads sensibles de OKX.

### OAuth tokens

- `access_token_encrypted` y `refresh_token_encrypted` deben cifrarse antes de DB.
- La llave de cifrado nunca debe estar en frontend.
- Tokens no se imprimen en logs ni audit logs.
- Rotacion/revocacion debe auditarse sin exponer token.

### Idempotency

- `request_hash` debe calcularse sobre payload sanitizado.
- Si `key` existe y `request_hash` coincide, devolver `response_snapshot`.
- Si `key` existe y `request_hash` difiere, devolver `IDEMPOTENCY_CONFLICT`.
- Si una operacion falla, guardar estado `failed` con error seguro.

### Audit logs

- Usar para ordenes, transfers, reconciliacion, rewards batch, cambios provider y acciones admin.
- `metadata` no debe contener secrets, tokens, Authorization headers, cookies ni provider raw payload sensible.

### Roles

- `admin`: administracion maxima.
- `finance`: fees, rewards batch, reconciliacion y ajustes autorizados.
- `compliance`: revision, reconciliacion y auditoria.
- `support`: soporte sin movimientos financieros.
- `developer_readonly`: diagnostico tecnico sin acciones mutantes.

### Reconciliation jobs

- No crear ajustes automaticos.
- Diferencias `warning` o `critical` requieren revision manual.
- `reviewed_by` debe apuntar a actor finance/compliance/admin.

## Pendiente para produccion

- Auth real.
- RBAC real.
- Cifrado de tokens con KMS o secreto backend rotado.
- RLS/permissions en Supabase.
- Tests de concurrencia.
- Rate limits.
- Observabilidad.
- Runbooks de incidentes.
