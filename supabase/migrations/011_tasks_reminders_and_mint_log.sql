-- Tasks table, server-side reminder state, and on-chain mint audit log.
--
-- 1. The tasks table was created manually in the dashboard and never captured
--    in migrations — recorded here so fresh environments work. On existing
--    databases the create is a no-op and only the new column is added.
-- 2. reminder_sent_at / accountability_last_reminder_sent_at let the cron
--    reminder endpoint (/api/push/reminders) deduplicate sends.
-- 3. onchain_mint_log is written only by the service role and gives the
--    record-habit API a per-user daily rate limit that clients cannot reset
--    (profiles.wallet_address is user-writable, so rotating wallets would
--    otherwise bypass the contract's per-wallet limit).

create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  due_date      timestamptz,
  reminder_at   timestamptz,
  is_completed  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on tasks(user_id);

alter table tasks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'tasks' and policyname = 'users manage own tasks'
  ) then
    create policy "users manage own tasks"
      on tasks
      for all
      using  (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- Server-side reminder dedup: set by the cron sender, never by the client
alter table tasks add column if not exists reminder_sent_at timestamptz;

create index if not exists tasks_reminder_due_idx
  on tasks(reminder_at)
  where reminder_sent_at is null and is_completed = false;

-- Daily streak-risk reminder dedup on the profile
alter table profiles
  add column if not exists accountability_last_reminder_sent_at timestamptz;

comment on column profiles.accountability_last_reminder_sent_at is
  'Last time a daily streak-risk push reminder was sent (dedup for the cron sender).';

-- Audit log of admin-wallet mints, one row per successful on-chain record.
-- No insert/update/delete policies: only the service role writes here.
create table if not exists onchain_mint_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  wallet      text not null,
  habit_type  text not null,
  tx_hash     text not null,
  minted_at   timestamptz not null default now()
);

create index if not exists onchain_mint_log_user_time_idx
  on onchain_mint_log(user_id, minted_at desc);

alter table onchain_mint_log enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'onchain_mint_log' and policyname = 'users read own mint log'
  ) then
    create policy "users read own mint log"
      on onchain_mint_log
      for select
      using (auth.uid() = user_id);
  end if;
end $$;
