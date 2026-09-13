-- 0006_owner_knowledge_updates.sql
-- Owner-confirmed knowledge updates. AI/chat cannot call this silently; product
-- code must explicitly confirm the correction first.

create policy knowledge_owner_insert on public.knowledge_documents
  for insert with check(auth.role() = 'authenticated' and (created_by is null or created_by = auth.uid()));
create policy knowledge_owner_update on public.knowledge_documents
  for update using(auth.role() = 'authenticated') with check(auth.role() = 'authenticated');
create policy knowledge_chunks_owner_write on public.knowledge_chunks
  for all using(auth.role() = 'authenticated') with check(auth.role() = 'authenticated');

create or replace function public.confirm_knowledge_correction(
  p_user_id uuid,
  p_correction_text text,
  p_reason text default null,
  p_previous_document_id uuid default null
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_document_id uuid;
  v_correction_id uuid;
  v_now timestamptz := now();
begin
  if p_user_id <> auth.uid() then raise exception 'OWNER_MISMATCH'; end if;
  if length(trim(p_correction_text)) < 3 then raise exception 'CORRECTION_TOO_SHORT'; end if;

  if p_previous_document_id is not null then
    update public.knowledge_documents
      set verification_status='disputed'
      where id=p_previous_document_id;
  end if;

  insert into public.knowledge_documents(category,title,content,source_type,verification_status,created_by)
    values('correction','Owner-confirmed correction',trim(p_correction_text),'owner_correction','verified',p_user_id)
    returning id into v_document_id;

  insert into public.knowledge_chunks(document_id,content,metadata)
    values(v_document_id,trim(p_correction_text),jsonb_build_object('source','owner_correction','verified',true));

  insert into public.knowledge_corrections(
    user_id,previous_document_id,correction_text,reason,status,replacement_document_id,confirmed_at
  ) values(
    p_user_id,p_previous_document_id,trim(p_correction_text),p_reason,'confirmed',v_document_id,v_now
  ) returning id into v_correction_id;

  insert into public.audit_logs(user_id,entity_type,entity_id,action,metadata)
    values(p_user_id,'knowledge_correction',v_correction_id,'KNOWLEDGE_CORRECTED',jsonb_build_object(
      'previousDocumentId',p_previous_document_id,'replacementDocumentId',v_document_id,'reason',p_reason
    ));

  return jsonb_build_object('correctionId',v_correction_id,'documentId',v_document_id,'confirmedAt',v_now);
end;
$$;
