-- Migration: 0002_conversations_and_sessions.sql
-- Adds conversation/session persistence for the AI assistant
-- and script versioning

-- ─── Conversations & Messages ────────────────────────────────────────────────

create table public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,
  context     jsonb not null default '{}'::jsonb,  -- active tool state, memory
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'tool')),
  content         text not null,
  tool_name       text,                           -- if role='tool', which tool was called
  tool_input      jsonb,
  tool_output     jsonb,
  tokens          int,
  model           text,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);

-- ─── Script Versions (immutable) ─────────────────────────────────────────────

create table public.script_versions (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version         int not null,
  content         jsonb not null,              -- full structured script snapshot
  change_summary  text,                        -- what changed in this version
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  unique (content_item_id, version)
);

-- ─── Background Jobs / Idempotency ──────────────────────────────────────────

create type public.job_status as enum ('queued', 'running', 'done', 'failed', 'cancelled');

create table public.background_jobs (
  id              uuid primary key default gen_random_uuid(),
  idempotency_key text unique not null,
  job_type        text not null,
  payload         jsonb not null default '{}'::jsonb,
  status          public.job_status not null default 'queued',
  result          jsonb,
  error_message   text,
  retry_count     int not null default 0,
  max_retries     int not null default 3,
  scheduled_for   timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index jobs_status_scheduled_idx on public.background_jobs(status, scheduled_for)
  where status in ('queued', 'running');

-- ─── Notification Delivery Log ────────────────────────────────────────────────

create table public.notification_deliveries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_type  text not null,        -- e.g. 'script_ready', 'overdue_task'
  channel     text not null,        -- e.g. 'email', 'whatsapp', 'push'
  template    text not null,
  payload     jsonb not null default '{}'::jsonb,
  status      text not null default 'pending',  -- pending | sent | failed
  sent_at     timestamptz,
  error       text,
  created_at  timestamptz not null default now()
);

create index notif_user_date_idx on public.notification_deliveries(user_id, created_at);

-- ─── Learning Insights & Recommendations ─────────────────────────────────────

create table public.learning_insights (
  id              uuid primary key default gen_random_uuid(),
  insight_type    text not null,    -- 'format_performance', 'topic_trend', 'audience_response'
  title           text not null,
  body            text not null,
  evidence        jsonb not null default '[]'::jsonb,  -- array of supporting data points
  confidence      text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  time_window_start timestamptz,
  time_window_end   timestamptz,
  created_at      timestamptz not null default now()
);

create table public.recommendations (
  id              uuid primary key default gen_random_uuid(),
  insight_id      uuid references public.learning_insights(id),
  recommendation  text not null,
  action_type     text,             -- 'create_content', 'adjust_format', 'focus_topic'
  action_payload  jsonb,
  status          text not null default 'pending',  -- pending | actioned | dismissed
  created_at      timestamptz not null default now()
);

-- ─── Claim Evidence Mapping ───────────────────────────────────────────────────

create type public.claim_type as enum (
  'personal_achievement', 'personal_fact', 'technical_claim',
  'research_finding', 'general_statement'
);

create type public.claim_verification as enum ('supported', 'unsupported', 'disputed', 'needs_review');

create table public.claims (
  id              uuid primary key default gen_random_uuid(),
  content         text not null,
  claim_type      public.claim_type not null,
  verification    public.claim_verification not null default 'needs_review',
  confidence      numeric(3,2) check (confidence between 0 and 1),
  blocking_reason text,
  script_id       uuid references public.scripts(id) on delete cascade,
  created_at      timestamptz not null default now()
);

create table public.claim_evidence (
  id            uuid primary key default gen_random_uuid(),
  claim_id      uuid not null references public.claims(id) on delete cascade,
  evidence_type text not null,   -- 'knowledge_chunk', 'source', 'voice_example'
  evidence_id   uuid not null,
  excerpt       text,
  relevance     numeric(3,2),
  created_at    timestamptz not null default now()
);

-- ─── Publishing Metadata ──────────────────────────────────────────────────────

create table public.publish_records (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  platform        text not null,
  platform_url    text,
  platform_post_id text,
  published_at    timestamptz not null default now(),
  published_by    uuid references public.profiles(id),
  notes           text
);

-- ─── RLS Policies for new tables ─────────────────────────────────────────────

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.script_versions enable row level security;
alter table public.background_jobs enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.learning_insights enable row level security;
alter table public.recommendations enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.publish_records enable row level security;

-- Users see their own conversations
create policy conversations_owner on public.conversations
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy messages_owner on public.messages
  for all using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id and c.user_id = auth.uid())
  );

-- Script versions: authenticated read, operators write
create policy script_versions_read on public.script_versions
  for select using (auth.role() = 'authenticated');

create policy script_versions_write on public.script_versions
  for insert with check (auth.role() = 'authenticated');

-- Jobs: operator+admin only
create policy jobs_staff on public.background_jobs
  for all using (public.current_role() in ('operator', 'admin'))
  with check (public.current_role() in ('operator', 'admin'));

-- Notifications: user sees their own
create policy notif_owner on public.notification_deliveries
  for select using (user_id = auth.uid());

-- Insights: operator read
create policy insights_staff on public.learning_insights
  for all using (public.current_role() in ('operator', 'admin'));

create policy recommendations_staff on public.recommendations
  for all using (public.current_role() in ('operator', 'admin'));

-- Claims: authenticated read (shown during review)
create policy claims_authenticated on public.claims
  for all using (auth.role() = 'authenticated');

create policy claim_evidence_authenticated on public.claim_evidence
  for all using (auth.role() = 'authenticated');

-- Publish records: authenticated
create policy publish_authenticated on public.publish_records
  for all using (auth.role() = 'authenticated');

-- ─── Trigger: updated_at for conversations ────────────────────────────────────

create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.update_updated_at();

-- ─── Additional indexes ───────────────────────────────────────────────────────

create index claims_script_idx on public.claims(script_id);
create index claim_evidence_claim_idx on public.claim_evidence(claim_id);
create index publish_content_idx on public.publish_records(content_item_id);
create index script_versions_content_idx on public.script_versions(content_item_id, version);
