-- 0007_intelligence_versioning_notifications.sql
-- Additive history and intelligence fields for the single-owner product.

alter table public.research_items
  add column if not exists query text,
  add column if not exists summary text,
  add column if not exists safe_claim text,
  add column if not exists warning text,
  add column if not exists confidence numeric(4,3),
  add column if not exists updated_at timestamptz not null default now();

alter table public.series_topics
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.masterclass_versions (
  id uuid primary key default gen_random_uuid(),
  masterclass_id uuid not null references public.masterclasses(id) on delete cascade,
  version int not null,
  outline jsonb not null,
  change_summary text,
  created_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique(masterclass_id, version)
);

create table if not exists public.masterclass_section_versions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.masterclass_sections(id) on delete cascade,
  version int not null,
  content jsonb not null,
  change_summary text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(section_id, version)
);

create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_owner_unread_idx
  on public.in_app_notifications(user_id, read_at, created_at desc);

alter table public.masterclass_versions enable row level security;
alter table public.masterclass_section_versions enable row level security;
alter table public.in_app_notifications enable row level security;

create policy masterclass_versions_owner on public.masterclass_versions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy masterclass_section_versions_owner on public.masterclass_section_versions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy in_app_notifications_owner on public.in_app_notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
