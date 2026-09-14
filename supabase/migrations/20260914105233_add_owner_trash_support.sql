-- Reversible owner-only trash for ideas and video/content plans.
alter table public.ideas
  add column if not exists trashed_at timestamptz,
  add column if not exists trashed_by uuid references public.profiles(id) on delete set null;

alter table public.content_items
  add column if not exists trashed_at timestamptz,
  add column if not exists trashed_by uuid references public.profiles(id) on delete set null;

create index if not exists ideas_active_created_at_idx
  on public.ideas(created_at desc) where trashed_at is null;
create index if not exists content_items_active_updated_at_idx
  on public.content_items(updated_at desc) where trashed_at is null;
