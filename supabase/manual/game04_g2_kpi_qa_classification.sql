-- Parent-only dev application. These four users were created exclusively for G2 QA.
-- No game assets/state changes. Existing normal/QA classification history retained.
insert into public.kpi_account_classification_periods(subject_id,classification,valid_from,reason)
select s.subject_id,'qa',s.created_at,'GAME04 G2 dedicated QA account; verification 2026-09-24'
from public.kpi_subjects s
where s.source_user_id in (
 'b9003819-973a-47b2-a1ef-9e503c60bb7b'::uuid,
 '6386ae36-9c7e-4a52-8fe7-28d4382ba35b'::uuid,
 '229ac838-28c3-48e4-a86a-45a25fbf72b9'::uuid,
 'd6dabf02-3eb2-430e-8352-561f8d735469'::uuid)
and not exists(select 1 from public.kpi_account_classification_periods p
 where p.subject_id=s.subject_id and p.classification='qa'
 and p.valid_from<=s.created_at and p.valid_to is null);
