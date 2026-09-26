-- Presentation only: align the current hosting-item label with the Territory UI.
-- Saved room snapshots remain unchanged, including their original master version.
update public.game04_redesign_master m
set data=jsonb_set(m.data,'{destinations}',(
 select jsonb_agg(case when d->>'itemId'='raid_unlock' then d||jsonb_build_object('itemName','領土侵攻札') else d end order by ord)
 from jsonb_array_elements(m.data->'destinations') with ordinality t(d,ord)
)),updated_at=now()
where m.key='territory';
