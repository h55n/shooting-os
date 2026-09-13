-- 0003_single_owner_model.sql
-- Additive migration: removes role-dependent product access without rewriting
-- already-applied migrations. The legacy role enum/column are intentionally kept
-- for compatibility and can be dropped in a later cleanup once production state
-- has been verified.

alter table public.profiles
  add column if not exists guide_mode boolean not null default true,
  add column if not exists sound_enabled boolean not null default true,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_skipped boolean not null default false;

-- Profile settings belong to the authenticated owner.
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Replace policies that depended on public.current_role(). RLS remains enabled.
drop policy if exists projects_staff on public.projects;
create policy projects_owner_authenticated on public.projects
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists series_staff on public.series;
create policy series_owner_authenticated on public.series
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists research_staff on public.research_items;
create policy research_owner_authenticated on public.research_items
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists sources_staff on public.sources;
create policy sources_owner_authenticated on public.sources
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists trends_staff on public.trend_items;
create policy trends_owner_authenticated on public.trend_items
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists masterclasses_staff on public.masterclasses;
create policy masterclasses_owner_authenticated on public.masterclasses
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists modules_staff on public.masterclass_modules;
create policy modules_owner_authenticated on public.masterclass_modules
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists sections_staff on public.masterclass_sections;
create policy sections_owner_authenticated on public.masterclass_sections
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists analytics_staff on public.content_analytics;
create policy analytics_owner_authenticated on public.content_analytics
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists voice_staff on public.voice_examples;
create policy voice_owner_authenticated on public.voice_examples
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists agent_admin on public.agent_runs;
create policy agent_owner_authenticated on public.agent_runs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists audit_admin on public.audit_logs;
create policy audit_owner_authenticated on public.audit_logs
  for select using (auth.role() = 'authenticated');
create policy audit_owner_insert on public.audit_logs
  for insert with check (auth.role() = 'authenticated');

drop policy if exists jobs_staff on public.background_jobs;
create policy jobs_owner_authenticated on public.background_jobs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists insights_staff on public.learning_insights;
create policy insights_owner_authenticated on public.learning_insights
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists recommendations_staff on public.recommendations;
create policy recommendations_owner_authenticated on public.recommendations
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Notification delivery records are owner-readable and owner-creatable.
drop policy if exists notif_owner_insert on public.notification_deliveries;
create policy notif_owner_insert on public.notification_deliveries
  for insert with check (user_id = auth.uid());

comment on column public.profiles.role is
  'Legacy compatibility field. Shooter Content OS product logic is single-owner and must not branch on this value.';
