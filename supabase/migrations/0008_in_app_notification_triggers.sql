-- 0008_in_app_notification_triggers.sql
-- In-app only completion alerts. No external notification provider required.

create or replace function public.notify_masterclass_lessons_ready()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'lessons_ready' and old.status is distinct from new.status and auth.uid() is not null then
    insert into public.in_app_notifications(user_id, kind, title, body, href)
    values(auth.uid(), 'masterclass_ready', 'Masterclass lessons ready', new.title, '/masterclass');
  end if;
  return new;
end;
$$;

drop trigger if exists masterclass_lessons_ready_notification on public.masterclasses;
create trigger masterclass_lessons_ready_notification
after update of status on public.masterclasses
for each row execute function public.notify_masterclass_lessons_ready();

create or replace function public.notify_research_ready()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'done' and auth.uid() is not null then
    insert into public.in_app_notifications(user_id, kind, title, body, href)
    values(
      auth.uid(),
      'research_ready',
      'Research ready',
      left(coalesce(new.safe_claim, new.summary, new.topic), 220),
      case when new.content_item_id is null then '/content' else '/content/' || new.content_item_id::text end
    );
  end if;
  return new;
end;
$$;

drop trigger if exists research_ready_notification on public.research_items;
create trigger research_ready_notification
after insert on public.research_items
for each row execute function public.notify_research_ready();
