-- Stable initial-selection cohort. Unknown is separate, never counted as <30.
-- Excludes fixtures, and selections where starting a new game was unavailable.
with selections as (
 select distinct on (visit_id,metadata->>'selection_id') visit_id,metadata,observed_at
 from public.game04_title_proof_events
 where event_type='SELECTION_VIEWED' and metadata->>'fixture'='false'
   and metadata->>'new_game_eligible'='true'
 order by visit_id,metadata->>'selection_id',observed_at
), cohort as (
 select s.*, exists(select 1 from public.game04_title_proof_events t
   where t.visit_id=s.visit_id and t.event_type='START_NEW_TAPPED'
   and t.metadata->>'selection_id'=s.metadata->>'selection_id'
   and t.metadata->>'fixture'='false') as converted,
 exists(select 1 from public.game04_title_proof_events t
   where t.visit_id=s.visit_id and t.event_type='ONLINE_CHANGED'
   and t.metadata->>'selection_id'=s.metadata->>'selection_id'
   and t.metadata->>'displayed' is distinct from s.metadata->>'displayed') as exposure_changed
 from selections s
)
select metadata->>'display_range' as display_range,metadata->>'displayed' as displayed,
 exposure_changed,count(*) as selections,count(*) filter(where converted) as new_game_taps,
 round(100.0*count(*) filter(where converted)/nullif(count(*),0),2) as cvr_percent
from cohort group by 1,2,3 order by 1,2,3;
