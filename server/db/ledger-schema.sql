-- QVEX Backend Ledger Schema
-- Supabase/PostgreSQL ready draft.
-- This schema is not wired to production money in this phase.

create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function prevent_financial_row_mutation()
returns trigger as $$
begin
  raise exception 'Financial ledger rows are immutable. Use compensating transactions.';
end;
$$ language plpgsql;

create or replace function prevent_final_ledger_transaction_update()
returns trigger as $$
begin
  if old.status in ('completed', 'failed', 'reversed') then
    raise exception 'Final ledger transactions are immutable. Use compensating transactions.';
  end if;

  return new;
end;
$$ language plpgsql;

create table if not exists ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  account_type text not null,
  asset text not null,
  status text not null default 'active',
  provider_id text null,
  allow_negative boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ledger_accounts_account_type_check check (
    account_type in (
      'available',
      'trading',
      'pool',
      'social',
      'rewards',
      'locked',
      'fees',
      'pending_withdrawal',
      'provider_reserve',
      'orbitx_reserve',
      'adjustment',
      'bonus',
      'chargeback',
      'dispute'
    )
  ),
  constraint ledger_accounts_status_check check (status in ('active', 'frozen', 'closed')),
  constraint ledger_accounts_asset_upper_check check (asset = upper(asset)),
  constraint ledger_accounts_asset_not_empty_check check (length(asset) between 2 and 16)
);

create unique index if not exists ux_ledger_accounts_user_scope
  on ledger_accounts (user_id, account_type, asset, coalesce(provider_id, ''))
  where user_id is not null;

create unique index if not exists ux_ledger_accounts_system_scope
  on ledger_accounts (account_type, asset, coalesce(provider_id, ''))
  where user_id is null;

create index if not exists ix_ledger_accounts_user_asset
  on ledger_accounts (user_id, asset);

create index if not exists ix_ledger_accounts_type_asset
  on ledger_accounts (account_type, asset);

create table if not exists ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_type text not null,
  status text not null,
  asset text not null,
  amount_decimal numeric(28,8) not null,
  amount_minor text null,
  idempotency_key text not null unique,
  reference_type text null,
  reference_id text null,
  provider_id text null,
  provider_reference text null,
  created_by uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ledger_transactions_type_check check (
    transaction_type in (
      'DEPOSIT_CREDIT',
      'WITHDRAWAL_REQUEST',
      'WITHDRAWAL_COMPLETE',
      'TRADE_LOCK',
      'TRADE_UNLOCK',
      'TRADE_SETTLEMENT',
      'POOL_SUBSCRIBE',
      'POOL_REDEEM',
      'POOL_REWARD',
      'SOCIAL_GIFT',
      'SOCIAL_GIFT_REFUND',
      'REWARD_DISTRIBUTION',
      'FEE_COLLECT',
      'FEE_REFUND',
      'INTERNAL_TRANSFER',
      'PROVIDER_RECONCILIATION',
      'MANUAL_ADJUSTMENT'
    )
  ),
  constraint ledger_transactions_status_check check (status in ('pending', 'completed', 'failed', 'reversed')),
  constraint ledger_transactions_asset_upper_check check (asset = upper(asset)),
  constraint ledger_transactions_amount_positive_check check (amount_decimal > 0),
  constraint ledger_transactions_idempotency_not_empty_check check (length(idempotency_key) >= 12)
);

create index if not exists ix_ledger_transactions_reference
  on ledger_transactions (reference_type, reference_id);

create index if not exists ix_ledger_transactions_provider_reference
  on ledger_transactions (provider_id, provider_reference);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references ledger_transactions(id),
  account_id uuid not null references ledger_accounts(id),
  direction text not null,
  asset text not null,
  amount_decimal numeric(28,8) not null,
  amount_minor text null,
  balance_after_decimal numeric(28,8) null,
  created_at timestamptz not null default now(),
  constraint ledger_entries_direction_check check (direction in ('debit', 'credit')),
  constraint ledger_entries_asset_upper_check check (asset = upper(asset)),
  constraint ledger_entries_amount_positive_check check (amount_decimal > 0)
);

create index if not exists ix_ledger_entries_transaction
  on ledger_entries (transaction_id);

create index if not exists ix_ledger_entries_account
  on ledger_entries (account_id);

create table if not exists ledger_balances (
  account_id uuid not null references ledger_accounts(id),
  asset text not null,
  balance_decimal numeric(28,8) not null default 0,
  locked_decimal numeric(28,8) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (account_id, asset),
  constraint ledger_balances_asset_upper_check check (asset = upper(asset)),
  constraint ledger_balances_locked_non_negative_check check (locked_decimal >= 0)
);

create table if not exists ledger_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid null,
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  before jsonb null,
  after jsonb null,
  ip_address text null,
  user_agent text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ix_ledger_audit_log_entity
  on ledger_audit_log (entity_type, entity_id);

create table if not exists provider_reconciliations (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  asset text not null,
  internal_total_decimal numeric(28,8) not null,
  provider_total_decimal numeric(28,8) not null,
  difference_decimal numeric(28,8) not null,
  status text not null,
  severity text not null,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint provider_reconciliations_asset_upper_check check (asset = upper(asset)),
  constraint provider_reconciliations_status_check check (status in ('open', 'reviewed', 'resolved')),
  constraint provider_reconciliations_severity_check check (severity in ('ok', 'warning', 'critical'))
);

create index if not exists ix_provider_reconciliations_provider_asset_created
  on provider_reconciliations (provider_id, asset, created_at);

create table if not exists pool_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pool_id text not null,
  asset text not null,
  principal_amount_decimal numeric(28,8) not null default 0,
  ranking_amount_decimal numeric(28,8) not null default 0,
  reward_amount_decimal numeric(28,8) not null default 0,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pool_positions_asset_upper_check check (asset = upper(asset)),
  constraint pool_positions_status_check check (status in ('active', 'redeemed', 'closed')),
  constraint pool_positions_principal_non_negative_check check (principal_amount_decimal >= 0),
  constraint pool_positions_ranking_non_negative_check check (ranking_amount_decimal >= 0),
  constraint pool_positions_reward_non_negative_check check (reward_amount_decimal >= 0)
);

create unique index if not exists ux_pool_positions_user_pool_asset_active
  on pool_positions (user_id, pool_id, asset)
  where status = 'active';

create index if not exists ix_pool_positions_user_pool
  on pool_positions (user_id, pool_id);

create table if not exists social_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  receiver_id uuid not null,
  gift_id text not null,
  asset text not null,
  amount_decimal numeric(28,8) not null,
  ledger_transaction_id uuid references ledger_transactions(id),
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint social_gifts_asset_upper_check check (asset = upper(asset)),
  constraint social_gifts_amount_positive_check check (amount_decimal > 0),
  constraint social_gifts_status_check check (status in ('sent', 'refunded', 'failed'))
);

create index if not exists ix_social_gifts_sender_created
  on social_gifts (sender_id, created_at);

create index if not exists ix_social_gifts_receiver_created
  on social_gifts (receiver_id, created_at);

drop trigger if exists trg_ledger_accounts_updated_at on ledger_accounts;
create trigger trg_ledger_accounts_updated_at
before update on ledger_accounts
for each row execute function set_updated_at();

drop trigger if exists trg_ledger_transactions_updated_at on ledger_transactions;
create trigger trg_ledger_transactions_updated_at
before update on ledger_transactions
for each row execute function set_updated_at();

drop trigger if exists trg_pool_positions_updated_at on pool_positions;
create trigger trg_pool_positions_updated_at
before update on pool_positions
for each row execute function set_updated_at();

drop trigger if exists trg_ledger_entries_no_update on ledger_entries;
create trigger trg_ledger_entries_no_update
before update on ledger_entries
for each row execute function prevent_financial_row_mutation();

drop trigger if exists trg_ledger_entries_no_delete on ledger_entries;
create trigger trg_ledger_entries_no_delete
before delete on ledger_entries
for each row execute function prevent_financial_row_mutation();

drop trigger if exists trg_ledger_transactions_no_delete on ledger_transactions;
create trigger trg_ledger_transactions_no_delete
before delete on ledger_transactions
for each row execute function prevent_financial_row_mutation();

drop trigger if exists trg_ledger_transactions_no_final_update on ledger_transactions;
create trigger trg_ledger_transactions_no_final_update
before update on ledger_transactions
for each row execute function prevent_final_ledger_transaction_update();

drop trigger if exists trg_ledger_audit_log_no_update on ledger_audit_log;
create trigger trg_ledger_audit_log_no_update
before update on ledger_audit_log
for each row execute function prevent_financial_row_mutation();

drop trigger if exists trg_ledger_audit_log_no_delete on ledger_audit_log;
create trigger trg_ledger_audit_log_no_delete
before delete on ledger_audit_log
for each row execute function prevent_financial_row_mutation();
