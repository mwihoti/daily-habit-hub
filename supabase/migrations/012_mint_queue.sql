-- Mint queue: decouples on-chain recording from the check-in request path.
--
-- The admin wallet is a single EOA, so concurrent serverless mints collide on
-- the nonce. Check-ins now enqueue here and a lease-guarded worker
-- (/api/web3/process-mints) drains the queue serially. The unique
-- (user_id, queued_day) index doubles as the per-user daily rate limit.
-- Written only by the service role; users may read their own rows.

create table if not exists mint_queue (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  wallet        text not null,
  habit_type    text not null,
  metadata_uri  text not null default '',
  queued_day    date not null default ((now() at time zone 'utc')::date),
  status        text not null default 'pending', -- pending | processing | confirmed | failed
  attempts      integer not null default 0,
  tx_hash       text,
  last_error    text,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz
);

create unique index if not exists mint_queue_user_day_idx
  on mint_queue(user_id, queued_day);

create index if not exists mint_queue_pending_idx
  on mint_queue(created_at)
  where status = 'pending';

alter table mint_queue enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'mint_queue' and policyname = 'users read own mint queue'
  ) then
    create policy "users read own mint queue"
      on mint_queue
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

-- Single-flight lease for background workers. A worker claims the lease with
-- an atomic conditional UPDATE (locked_until < now()); no advisory locks
-- needed, so it works over PostgREST. Service-role only.
create table if not exists worker_leases (
  name          text primary key,
  locked_until  timestamptz not null default now()
);

insert into worker_leases (name)
  values ('mint-worker')
  on conflict (name) do nothing;

alter table worker_leases enable row level security;
