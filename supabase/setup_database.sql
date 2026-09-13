-- Complete Database Schema for Shooting AI Content & Coaching OS
-- Run this in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/btcnfsxaxmsbbbctrkqq/sql)

-- 1. Initial Schema
create extension if not exists vector;
create type public.user_role as enum ('father','operator','admin');
create type public.content_status as enum ('IDEA','PLANNED','RESEARCHING','SCRIPT_DRAFT','REVIEW','APPROVED','RECORDING','EDITING','SCHEDULED','PUBLISHED','ANALYZING','LEARNED','BLOCKED','REJECTED','ARCHIVED');
create type public.verification_status as enum ('verified','unverified','disputed');
create type public.task_status as enum ('todo','in_progress','done','blocked');
create type public.trend_status as enum ('new','approved','dismissed','converted');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,name text not null,role public.user_role not null default 'father',created_at timestamptz not null default now());
create table public.projects(id uuid primary key default gen_random_uuid(),name text not null,description text,status text not null default 'active',created_at timestamptz not null default now());
create table public.series(id uuid primary key default gen_random_uuid(),project_id uuid references public.projects(id) on delete set null,name text not null,description text,target_audience text,content_goal text,status text not null default 'active',created_at timestamptz not null default now());
create table public.content_items(id uuid primary key default gen_random_uuid(),series_id uuid references public.series(id) on delete set null,title text not null,content_type text not null,pillar text not null,funnel_stage text,status public.content_status not null default 'IDEA',priority int not null default 5,scheduled_date date,published_at timestamptz,sequence_order int,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.content_tasks(id uuid primary key default gen_random_uuid(),content_item_id uuid not null references public.content_items(id) on delete cascade,task_type text not null,status public.task_status not null default 'todo',assigned_to uuid references public.profiles(id),due_date date,completed_at timestamptz,created_at timestamptz not null default now());
create table public.content_dependencies(content_item_id uuid not null references public.content_items(id) on delete cascade,depends_on_item_id uuid not null references public.content_items(id) on delete cascade,primary key(content_item_id,depends_on_item_id),check(content_item_id<>depends_on_item_id));
create table public.ideas(id uuid primary key default gen_random_uuid(),raw_input text not null,input_type text not null default 'text',audio_path text,transcript text,normalized_idea text,status text not null default 'new',created_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table public.scripts(id uuid primary key default gen_random_uuid(),content_item_id uuid not null references public.content_items(id) on delete cascade,version int not null,content jsonb not null,status text not null default 'draft',model text,approved_by uuid references public.profiles(id),created_at timestamptz not null default now(),unique(content_item_id,version));
create table public.knowledge_documents(id uuid primary key default gen_random_uuid(),category text not null,title text not null,content text not null,source_type text not null,verification_status public.verification_status not null default 'unverified',source_url text,created_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table public.knowledge_chunks(id uuid primary key default gen_random_uuid(),document_id uuid not null references public.knowledge_documents(id) on delete cascade,content text not null,embedding vector(1536),metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create index knowledge_chunks_embedding_idx on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops) with (lists=100);
create table public.research_items(id uuid primary key default gen_random_uuid(),content_item_id uuid references public.content_items(id) on delete set null,topic text not null,findings text,status text not null default 'queued',created_at timestamptz not null default now());
create table public.sources(id uuid primary key default gen_random_uuid(),research_item_id uuid not null references public.research_items(id) on delete cascade,url text not null,title text,publisher text,published_at timestamptz,accessed_at timestamptz not null default now(),credibility numeric(4,3));
create table public.trend_items(id uuid primary key default gen_random_uuid(),topic text not null,source text not null,signal_type text,relevance_score numeric(5,2),urgency text,status public.trend_status not null default 'new',detected_at timestamptz not null default now(),metadata jsonb not null default '{}'::jsonb);
create table public.masterclasses(id uuid primary key default gen_random_uuid(),title text not null,status text not null default 'draft',created_at timestamptz not null default now());
create table public.masterclass_modules(id uuid primary key default gen_random_uuid(),masterclass_id uuid not null references public.masterclasses(id) on delete cascade,title text not null,"order" int not null,learning_objective text,status text not null default 'draft');
create table public.masterclass_sections(id uuid primary key default gen_random_uuid(),module_id uuid not null references public.masterclass_modules(id) on delete cascade,title text not null,content text not null,content_source_id uuid,status text not null default 'draft',approved_by uuid references public.profiles(id),version int not null default 1);
create table public.content_analytics(id uuid primary key default gen_random_uuid(),content_item_id uuid not null references public.content_items(id) on delete cascade,platform text not null,metric_name text not null,metric_value numeric not null,recorded_at timestamptz not null default now());
create table public.feedback(id uuid primary key default gen_random_uuid(),content_item_id uuid references public.content_items(id) on delete cascade,user_id uuid references public.profiles(id),feedback_type text not null,feedback_text text,created_at timestamptz not null default now());
create table public.agent_runs(id uuid primary key default gen_random_uuid(),agent_name text not null,input jsonb not null,output jsonb,model text,tokens int,cost numeric(12,6),status text not null,created_at timestamptz not null default now());
create table public.audit_logs(id uuid primary key default gen_random_uuid(),user_id uuid references public.profiles(id),entity_type text not null,entity_id uuid,action text not null,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table public.voice_examples(id uuid primary key default gen_random_uuid(),title text not null,content text not null,source_type text not null,verification_status public.verification_status not null default 'unverified',created_at timestamptz not null default now());
create table public.notification_preferences(id uuid primary key default gen_random_uuid(),user_id uuid unique not null references public.profiles(id) on delete cascade,max_daily int not null default 3,channels jsonb not null default '{"push":true}'::jsonb);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(new.email,'@',1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.match_knowledge(query_embedding vector(1536),match_count int default 8,min_similarity float default 0.35) returns table(id uuid,document_id uuid,content text,similarity float,metadata jsonb) language sql stable as $$ select kc.id,kc.document_id,kc.content,1-(kc.embedding<=>query_embedding) as similarity,kc.metadata from public.knowledge_chunks kc join public.knowledge_documents kd on kd.id=kc.document_id where kd.verification_status='verified' and kc.embedding is not null and 1-(kc.embedding<=>query_embedding)>=min_similarity order by kc.embedding<=>query_embedding limit match_count; $$;

alter table public.profiles enable row level security; alter table public.projects enable row level security; alter table public.series enable row level security; alter table public.content_items enable row level security; alter table public.content_tasks enable row level security; alter table public.ideas enable row level security; alter table public.scripts enable row level security; alter table public.knowledge_documents enable row level security; alter table public.knowledge_chunks enable row level security; alter table public.research_items enable row level security; alter table public.sources enable row level security; alter table public.trend_items enable row level security; alter table public.masterclasses enable row level security; alter table public.masterclass_modules enable row level security; alter table public.masterclass_sections enable row level security; alter table public.content_analytics enable row level security; alter table public.feedback enable row level security; alter table public.agent_runs enable row level security; alter table public.audit_logs enable row level security; alter table public.voice_examples enable row level security; alter table public.notification_preferences enable row level security;
create policy profiles_self on public.profiles for select using(auth.uid()=id); create policy content_authenticated on public.content_items for all using(auth.role()='authenticated') with check(auth.role()='authenticated'); create policy ideas_authenticated on public.ideas for all using(auth.role()='authenticated') with check(auth.role()='authenticated'); create policy scripts_authenticated on public.scripts for all using(auth.role()='authenticated') with check(auth.role()='authenticated'); create policy tasks_authenticated on public.content_tasks for all using(auth.role()='authenticated') with check(auth.role()='authenticated');
create policy knowledge_private on public.knowledge_documents for select using(auth.role()='authenticated'); create policy knowledge_chunks_private on public.knowledge_chunks for select using(auth.role()='authenticated');
create or replace function public.current_role() returns public.user_role language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid(); $$;
create policy projects_staff on public.projects for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy series_staff on public.series for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy research_staff on public.research_items for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy sources_staff on public.sources for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy trends_staff on public.trend_items for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy masterclasses_staff on public.masterclasses for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy modules_staff on public.masterclass_modules for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy sections_staff on public.masterclass_sections for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy analytics_staff on public.content_analytics for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy feedback_authenticated on public.feedback for all using(auth.role()='authenticated') with check(auth.role()='authenticated');
create policy voice_staff on public.voice_examples for all using(public.current_role() in ('operator','admin')) with check(public.current_role() in ('operator','admin'));
create policy notification_self on public.notification_preferences for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy agent_admin on public.agent_runs for select using(public.current_role() in ('operator','admin'));
create policy audit_admin on public.audit_logs for select using(public.current_role()='admin');

-- 2. Conversations, Versions, Jobs & Claims Schema
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text,
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'tool')),
  content         text not null,
  tool_name       text,
  tool_input      jsonb,
  tool_output     jsonb,
  tokens          int,
  model           text,
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

create table if not exists public.script_versions (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version         int not null,
  content         jsonb not null,
  change_summary  text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  unique (content_item_id, version)
);

create type public.job_status as enum ('queued', 'running', 'done', 'failed', 'cancelled');

create table if not exists public.background_jobs (
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

create index if not exists jobs_status_scheduled_idx on public.background_jobs(status, scheduled_for)
  where status in ('queued', 'running');

create table if not exists public.notification_deliveries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_type  text not null,
  channel     text not null,
  template    text not null,
  payload     jsonb not null default '{}'::jsonb,
  status      text not null default 'pending',
  sent_at     timestamptz,
  error       text,
  created_at  timestamptz not null default now()
);

create index if not exists notif_user_date_idx on public.notification_deliveries(user_id, created_at);

create table if not exists public.learning_insights (
  id              uuid primary key default gen_random_uuid(),
  insight_type    text not null,
  title           text not null,
  body            text not null,
  evidence        jsonb not null default '[]'::jsonb,
  confidence      text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  time_window_start timestamptz,
  time_window_end   timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.recommendations (
  id              uuid primary key default gen_random_uuid(),
  insight_id      uuid references public.learning_insights(id),
  recommendation  text not null,
  action_type     text,
  action_payload  jsonb,
  status          text not null default 'pending',
  created_at      timestamptz not null default now()
);

create type public.claim_type as enum (
  'personal_achievement', 'personal_fact', 'technical_claim',
  'research_finding', 'general_statement'
);

create type public.claim_verification as enum ('supported', 'unsupported', 'disputed', 'needs_review');

create table if not exists public.claims (
  id              uuid primary key default gen_random_uuid(),
  content         text not null,
  claim_type      public.claim_type not null,
  verification    public.claim_verification not null default 'needs_review',
  confidence      numeric(3,2) check (confidence between 0 and 1),
  blocking_reason text,
  script_id       uuid references public.scripts(id) on delete cascade,
  created_at      timestamptz not null default now()
);

create table if not exists public.claim_evidence (
  id            uuid primary key default gen_random_uuid(),
  claim_id      uuid not null references public.claims(id) on delete cascade,
  evidence_type text not null,
  evidence_id   uuid not null,
  excerpt       text,
  relevance     numeric(3,2),
  created_at    timestamptz not null default now()
);

create table if not exists public.publish_records (
  id              uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  platform        text not null,
  platform_url    text,
  platform_post_id text,
  published_at    timestamptz not null default now(),
  published_by    uuid references public.profiles(id),
  notes           text
);

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

create policy conversations_owner on public.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_owner on public.messages for all using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy script_versions_read on public.script_versions for select using (auth.role() = 'authenticated');
create policy script_versions_write on public.script_versions for insert with check (auth.role() = 'authenticated');
create policy jobs_staff on public.background_jobs for all using (public.current_role() in ('operator', 'admin')) with check (public.current_role() in ('operator', 'admin'));
create policy notif_owner on public.notification_deliveries for select using (user_id = auth.uid());
create policy insights_staff on public.learning_insights for all using (public.current_role() in ('operator', 'admin'));
create policy recommendations_staff on public.recommendations for all using (public.current_role() in ('operator', 'admin'));
create policy claims_authenticated on public.claims for all using (auth.role() = 'authenticated');
create policy claim_evidence_authenticated on public.claim_evidence for all using (auth.role() = 'authenticated');
create policy publish_authenticated on public.publish_records for all using (auth.role() = 'authenticated');

create or replace function public.update_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger conversations_updated_at before update on public.conversations for each row execute procedure public.update_updated_at();

create index if not exists claims_script_idx on public.claims(script_id);
create index if not exists claim_evidence_claim_idx on public.claim_evidence(claim_id);
create index if not exists publish_content_idx on public.publish_records(content_item_id);
create index if not exists script_versions_content_idx on public.script_versions(content_item_id, version);
