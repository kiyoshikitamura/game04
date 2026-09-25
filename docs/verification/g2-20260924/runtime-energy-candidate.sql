-- Target: GAME04 development lrgyllgzcdcphlbmkknc ONLY. No user-state rewrite.
-- Other runtime flags and approval status deliberately preserved.
update public.game04_redesign_master
set data=jsonb_set(jsonb_set(data,'{energyMax}','100'::jsonb),'{energyRecoverySeconds}','300'::jsonb)
where key='runtime';
