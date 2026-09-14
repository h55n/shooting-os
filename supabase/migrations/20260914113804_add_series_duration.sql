-- Series plans may be short, medium, or monthly. Existing plans retain their original 30-topic intent.
alter table public.series
  add column if not exists duration_days integer not null default 30
  check (duration_days in (7, 15, 30));
