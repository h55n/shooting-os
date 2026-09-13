-- 0004_creation_and_production_flow.sql
-- Additive persistence for the single-owner creation, First 10, planning and
-- masterclass flows. Existing tables/migrations are intentionally preserved.

alter table public.ideas
  add column if not exists source text not null default 'owner',
  add column if not exists suggested_reason text;

alter table public.content_items
  add column if not exists idea_id uuid references public.ideas(id) on delete set null,
  add column if not exists category_id text,
  add column if not exists brief jsonb not null default '{}'::jsonb,
  add column if not exists shooting_guidance jsonb,
  add column if not exists shot_at timestamptz,
  add column if not exists ready_target date,
  add column if not exists publish_target date,
  add column if not exists offline_enabled boolean not null default false;

create unique index if not exists content_items_idea_unique
  on public.content_items(idea_id)
  where idea_id is not null;

alter table public.script_versions
  add column if not exists parent_version int,
  add column if not exists source text not null default 'ai',
  add column if not exists change_reason text;

create table if not exists public.first_ten_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id)
);

create table if not exists public.first_ten_items (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.first_ten_journeys(id) on delete cascade,
  position int not null check(position between 1 and 10),
  title text not null,
  purpose text,
  audience text,
  category_id text,
  content_item_id uuid references public.content_items(id) on delete set null,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  unique(journey_id, position)
);

create table if not exists public.series_topics (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete cascade,
  position int not null,
  title text not null,
  angle text,
  category_id text,
  status text not null default 'proposed',
  content_item_id uuid references public.content_items(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(series_id, position)
);

alter table public.masterclasses
  add column if not exists audience text,
  add column if not exists learning_outcome text,
  add column if not exists target_duration_minutes int,
  add column if not exists outline jsonb not null default '{}'::jsonb,
  add column if not exists approved_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.masterclass_modules
  add column if not exists estimated_minutes int;

alter table public.masterclass_sections
  add column if not exists learning_objective text,
  add column if not exists demonstration text,
  add column if not exists practice text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.first_ten_journeys enable row level security;
alter table public.first_ten_items enable row level security;
alter table public.series_topics enable row level security;

create policy first_ten_journeys_owner on public.first_ten_journeys
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy first_ten_items_owner on public.first_ten_items
  for all using (
    exists (
      select 1 from public.first_ten_journeys j
      where j.id = first_ten_items.journey_id and j.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.first_ten_journeys j
      where j.id = first_ten_items.journey_id and j.user_id = auth.uid()
    )
  );
create policy series_topics_owner on public.series_topics
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Persist an idea and its first structured script version together.
create or replace function public.create_content_from_idea(
  p_idea_id uuid,
  p_title text,
  p_content_type text,
  p_pillar text,
  p_category_id text,
  p_brief jsonb,
  p_script jsonb,
  p_model text,
  p_user_id uuid
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_content_id uuid;
  v_existing uuid;
begin
  select id into v_existing from public.content_items where idea_id = p_idea_id limit 1;
  if v_existing is not null then return v_existing; end if;

  insert into public.content_items(
    idea_id, title, content_type, pillar, category_id, brief, status, priority
  ) values (
    p_idea_id, p_title, p_content_type, p_pillar, p_category_id, coalesce(p_brief, '{}'::jsonb), 'REVIEW', 5
  ) returning id into v_content_id;

  insert into public.scripts(content_item_id, version, content, status, model)
  values(v_content_id, 1, p_script, 'draft', p_model);

  insert into public.script_versions(
    content_item_id, version, content, change_summary, source, change_reason, created_by
  ) values(
    v_content_id, 1, p_script, 'Initial structured script', 'ai', 'Created from idea', p_user_id
  );

  update public.ideas set status = 'converted' where id = p_idea_id;
  return v_content_id;
end;
$$;

-- Human approval is a single DB transaction with audit history.
create or replace function public.approve_content(
  p_content_id uuid,
  p_user_id uuid,
  p_notes text default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous public.content_status;
  v_now timestamptz := now();
begin
  select status into v_previous from public.content_items where id = p_content_id for update;
  if v_previous is null then raise exception 'CONTENT_NOT_FOUND'; end if;
  if v_previous not in ('REVIEW', 'SCRIPT_DRAFT') then raise exception 'INVALID_APPROVAL_STATE:%', v_previous; end if;

  update public.content_items set status='APPROVED', updated_at=v_now where id=p_content_id;
  update public.scripts set status='approved', approved_by=p_user_id
    where id = (
      select id from public.scripts where content_item_id=p_content_id order by version desc limit 1
    );
  insert into public.audit_logs(user_id, entity_type, entity_id, action, metadata)
    values(p_user_id, 'content_item', p_content_id, 'APPROVED', jsonb_build_object(
      'previousStatus', v_previous, 'newStatus', 'APPROVED', 'notes', p_notes, 'approvedAt', v_now
    ));
  return jsonb_build_object('id',p_content_id,'previousStatus',v_previous,'newStatus','APPROVED','approvedAt',v_now);
end;
$$;

-- "Shot Ho Gaya" must complete the shoot task and move production forward atomically.
create or replace function public.mark_content_shot(
  p_content_id uuid,
  p_user_id uuid
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous public.content_status;
  v_now timestamptz := now();
begin
  select status into v_previous from public.content_items where id=p_content_id for update;
  if v_previous is null then raise exception 'CONTENT_NOT_FOUND'; end if;
  if v_previous not in ('APPROVED','RECORDING') then raise exception 'INVALID_SHOT_STATE:%', v_previous; end if;

  update public.content_items
    set status='EDITING', shot_at=v_now, updated_at=v_now
    where id=p_content_id;

  update public.content_tasks
    set status='done', completed_at=v_now
    where content_item_id=p_content_id and lower(task_type)='shoot' and status <> 'done';

  insert into public.audit_logs(user_id, entity_type, entity_id, action, metadata)
    values(p_user_id,'content_item',p_content_id,'SHOT_COMPLETED',jsonb_build_object(
      'previousStatus',v_previous,'newStatus','EDITING','shotAt',v_now
    ));

  return jsonb_build_object('id',p_content_id,'previousStatus',v_previous,'newStatus','EDITING','shotAt',v_now);
end;
$$;
