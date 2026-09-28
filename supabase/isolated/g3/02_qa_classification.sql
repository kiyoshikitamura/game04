-- Run after exactly two login-capable Auth users are created through Auth Admin API.
-- psql variables: qa_a_id, qa_b_id. This creates no auth.users/session rows.
begin;
create temporary table g3_qa_ids(id uuid primary key) on commit drop;
insert into g3_qa_ids values (:'qa_a_id'::uuid),(:'qa_b_id'::uuid);
do $$ begin
 if (select count(*) from g3_qa_ids)<>2 then raise exception 'TWO_DISTINCT_QA_IDS_REQUIRED'; end if;
end $$;
insert into public.kpi_subjects(source_user_id,registered_at,registration_type,first_authenticated_at)
values (:'qa_a_id'::uuid,now(),'anonymous',null),(:'qa_b_id'::uuid,now(),'authenticated',now())
on conflict(source_user_id) do nothing;
insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
select subject_id,'qa',registered_at,'GAME04 G3 isolated acceptance fixture'
from public.kpi_subjects where source_user_id in (select id from g3_qa_ids)
and not exists(select 1 from public.kpi_account_classification_periods p where p.subject_id=kpi_subjects.subject_id and p.valid_to is null);
commit;
