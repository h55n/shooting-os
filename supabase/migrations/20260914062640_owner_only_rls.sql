-- The product has exactly one account. This migration supersedes every earlier
-- broad authenticated policy without disabling RLS or trusting JWT metadata.
do $$
declare
  table_name text;
  policy_name text;
  owner_id constant uuid := '5fbf6aaa-8445-48a9-bc57-9ef0f61c628e';
begin
  for table_name in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename <> 'spatial_ref_sys'
  loop
    execute format('alter table public.%I enable row level security', table_name);

    for policy_name in
      select polname
      from pg_policy
      where polrelid = format('public.%I', table_name)::regclass
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    end loop;

    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format(
      'create policy owner_only on public.%I for all to authenticated using ((select auth.uid()) = %L::uuid) with check ((select auth.uid()) = %L::uuid)',
      table_name,
      owner_id::text,
      owner_id::text
    );
  end loop;
end $$;
