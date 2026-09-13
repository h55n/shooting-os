-- 0005_knowledge_and_progress.sql
-- Additive versioned knowledge-correction support and First 10 progress wiring.

create table if not exists public.knowledge_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  previous_document_id uuid references public.knowledge_documents(id) on delete set null,
  correction_text text not null,
  reason text,
  status text not null default 'confirmed' check(status in ('proposed','confirmed','rejected')),
  replacement_document_id uuid references public.knowledge_documents(id) on delete set null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.knowledge_corrections enable row level security;
create policy knowledge_corrections_owner on public.knowledge_corrections
  for all using(user_id = auth.uid()) with check(user_id = auth.uid());

-- Extend the atomic shoot-completion action so First 10 progress cannot drift.
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
  v_journey_id uuid;
begin
  select status into v_previous from public.content_items where id=p_content_id for update;
  if v_previous is null then raise exception 'CONTENT_NOT_FOUND'; end if;
  if v_previous not in ('APPROVED','RECORDING') then raise exception 'INVALID_SHOT_STATE:%', v_previous; end if;

  update public.content_items set status='EDITING', shot_at=v_now, updated_at=v_now where id=p_content_id;
  update public.content_tasks set status='done', completed_at=v_now
    where content_item_id=p_content_id and lower(task_type)='shoot' and status <> 'done';

  update public.first_ten_items
    set status='completed'
    where content_item_id=p_content_id
    returning journey_id into v_journey_id;

  if v_journey_id is not null and not exists (
    select 1 from public.first_ten_items where journey_id=v_journey_id and status <> 'completed'
  ) then
    update public.first_ten_journeys set status='completed', completed_at=v_now where id=v_journey_id;
  end if;

  insert into public.audit_logs(user_id, entity_type, entity_id, action, metadata)
    values(p_user_id,'content_item',p_content_id,'SHOT_COMPLETED',jsonb_build_object(
      'previousStatus',v_previous,'newStatus','EDITING','shotAt',v_now,'firstTenJourneyId',v_journey_id
    ));

  return jsonb_build_object('id',p_content_id,'previousStatus',v_previous,'newStatus','EDITING','shotAt',v_now,'firstTenJourneyId',v_journey_id);
end;
$$;
